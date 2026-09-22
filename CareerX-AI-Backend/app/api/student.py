from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..db import get_db
from ..models import User, StudentProfile, Skill, StudentSkill, Certification, Project, Feedback, AuditLog, AcademicRecord, SubjectResult
from ..schemas import StudentOut, RecommendationOut, SimulationRequest, CertificateRecommendation, ProjectRecommendation, FeedbackIn, CoachRequest
from ..security import get_current_user, require_roles
from ..services.ai_engine import career_recommendations, certificate_recommendations, project_recommendations, readiness_score, anomaly_score, coach_answer
from ..services.academic_engine import extract_academic_strengths, calculate_academic_trend
from ..services.career_data import CAREERS

router = APIRouter(tags=["student"])

def profile_for_user(db: Session, user_id: int):
    return db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()

def get_student_academic_context(db: Session, profile_id: int):
    records = db.query(AcademicRecord).filter_by(student_id=profile_id).order_by(AcademicRecord.semester.asc()).all()
    subjects = db.query(SubjectResult).join(AcademicRecord).filter(AcademicRecord.student_id == profile_id).all()
    latest_record = records[-1] if records else None
    active_arrears = latest_record.arrear_count if latest_record else 0
    academic_score = latest_record.academic_progress_score if latest_record else None
    return records, subjects, latest_record, active_arrears, academic_score

def serialize_student(db: Session, profile: StudentProfile):
    user = db.get(User, profile.user_id)
    rows = db.query(StudentSkill, Skill).join(Skill, StudentSkill.skill_id == Skill.id).filter(StudentSkill.student_id == profile.id).all()
    skills = [{"name": s.name, "level": ss.level, "category": s.category, "evidence": ss.evidence} for ss, s in rows]
    skills_dict = {s.name: ss.level for ss, s in rows}
    project_count = db.query(Project).filter(Project.student_id == profile.id).count()
    
    records, subjects, latest_record, active_arrears, academic_score = get_student_academic_context(db, profile.id)
    cert_count = db.query(Certification).filter(Certification.student_id == profile.id).count()
    assessed_count = sum(1 for ss, s in rows if ss.evidence in ["Assessed", "Verified"])
    
    recs = career_recommendations(
        skills_dict, profile.interests or [], profile.cgpa, project_count, profile.target_role,
        subjects=subjects, academic_score=academic_score, active_arrears=active_arrears,
        cert_count=cert_count, assessed_skill_count=assessed_count
    )
    top_match = recs[0]["match_score"] if recs else 85.0
    return {
        "id": profile.id, "user_id": profile.user_id, "full_name": user.full_name if user else "Student",
        "department": profile.department, "graduation_year": profile.graduation_year, "cgpa": profile.cgpa,
        "target_role": profile.target_role, "interests": profile.interests or [],
        "readiness_score": profile.readiness_score, "trust_score": profile.trust_score,
        "roadmap_progress": profile.roadmap_progress, "career_match": top_match, "skills": skills
    }

def skill_map(db: Session, profile_id: int):
    rows = db.query(StudentSkill, Skill).join(Skill, StudentSkill.skill_id == Skill.id).filter(StudentSkill.student_id == profile_id).all()
    return {s.name: ss.level for ss, s in rows}, rows

@router.get("/students/me", response_model=StudentOut)
def get_me(user: User = Depends(require_roles("student", "mentor", "admin")), db: Session = Depends(get_db)):
    profile = profile_for_user(db, user.id)
    if not profile:
        profile = db.query(StudentProfile).first()
        if not profile:
            raise HTTPException(404, "Student profile not found")
    return serialize_student(db, profile)

@router.get("/careers/recommendations", response_model=list[RecommendationOut])
def recommendations(user: User = Depends(require_roles("student", "mentor", "admin")), db: Session = Depends(get_db)):
    profile = profile_for_user(db, user.id)
    if not profile:
        profile = db.query(StudentProfile).first()
        if not profile: raise HTTPException(404, "Student profile not found")
    skills, rows = skill_map(db, profile.id)
    projects = db.query(Project).filter(Project.student_id == profile.id).count()
    records, subjects, latest_record, active_arrears, academic_score = get_student_academic_context(db, profile.id)
    cert_count = db.query(Certification).filter(Certification.student_id == profile.id).count()
    assessed_count = sum(1 for ss, s in rows if ss.evidence in ["Assessed", "Verified"])
    return career_recommendations(
        skills, profile.interests or [], profile.cgpa, projects, profile.target_role,
        subjects=subjects, academic_score=academic_score, active_arrears=active_arrears,
        cert_count=cert_count, assessed_skill_count=assessed_count
    )

@router.post("/simulate")
def simulate(payload: SimulationRequest, user: User = Depends(require_roles("student", "mentor", "admin")), db: Session = Depends(get_db)):
    profile = profile_for_user(db, user.id)
    if not profile:
        profile = db.query(StudentProfile).first()
        if not profile: raise HTTPException(404, "Student profile not found")
    base_skills, rows = skill_map(db, profile.id)
    current_projects = db.query(Project).filter(Project.student_id == profile.id).count()
    records, subjects, latest_record, active_arrears, academic_score = get_student_academic_context(db, profile.id)
    cert_count = db.query(Certification).filter(Certification.student_id == profile.id).count()
    assessed_count = sum(1 for ss, s in rows if ss.evidence in ["Assessed", "Verified"])
    
    current = career_recommendations(
        base_skills, profile.interests or [], profile.cgpa, current_projects, profile.target_role,
        subjects=subjects, academic_score=academic_score, active_arrears=active_arrears,
        cert_count=cert_count, assessed_skill_count=assessed_count
    )
    simulated_skills = dict(base_skills)
    for name in payload.add_skills:
        simulated_skills[name] = max(70, simulated_skills.get(name, 0))
    project_count = current_projects + len(payload.projects)
    sim_cert_count = cert_count + len(payload.certifications)
    results = career_recommendations(
        simulated_skills, profile.interests or [], profile.cgpa, project_count, profile.target_role,
        subjects=subjects, academic_score=academic_score, active_arrears=active_arrears,
        cert_count=sim_cert_count, assessed_skill_count=assessed_count
    )
    return {"current": current, "after": results}

@router.get("/recommendations/certificates", response_model=list[CertificateRecommendation])
def certificate_recs(user: User = Depends(require_roles("student", "mentor", "admin")), db: Session = Depends(get_db)):
    profile = profile_for_user(db, user.id)
    if not profile:
        profile = db.query(StudentProfile).first()
        if not profile: raise HTTPException(404, "Student profile not found")
    skills, _ = skill_map(db, profile.id)
    target = profile.target_role
    career = next((c for c in CAREERS if c["name"] == target), CAREERS[0])
    gaps = [s for s, need in career["required_skills"].items() if skills.get(s, 0) < need]
    return certificate_recommendations(target, gaps)

@router.get("/recommendations/projects", response_model=list[ProjectRecommendation])
def project_recs(user: User = Depends(require_roles("student", "mentor", "admin")), db: Session = Depends(get_db)):
    profile = profile_for_user(db, user.id)
    if not profile:
        profile = db.query(StudentProfile).first()
        if not profile: raise HTTPException(404, "Student profile not found")
    skills, _ = skill_map(db, profile.id)
    career = next((c for c in CAREERS if c["name"] == profile.target_role), CAREERS[0])
    gaps = [s for s, need in career["required_skills"].items() if skills.get(s, 0) < need]
    return project_recommendations(profile.target_role, gaps)

@router.get("/readiness")
def readiness(user: User = Depends(require_roles("student", "mentor", "admin")), db: Session = Depends(get_db)):
    profile = profile_for_user(db, user.id)
    if not profile:
        profile = db.query(StudentProfile).first()
        if not profile: raise HTTPException(404, "Student profile not found")
    skills, _ = skill_map(db, profile.id)
    mean = sum(skills.values()) / len(skills) if skills else 0
    certs = db.query(Certification).filter(Certification.student_id == profile.id).count()
    projects = db.query(Project).filter(Project.student_id == profile.id).count()
    records, subjects, latest_record, active_arrears, academic_score = get_student_academic_context(db, profile.id)
    
    score = readiness_score(
        mean, projects, profile.cgpa, certs, communication=70.0,
        academic_score=academic_score, active_arrears=active_arrears
    )
    profile.readiness_score = score
    db.commit()
    return {
        "overall": score,
        "technical": round(mean, 1),
        "academic": round(academic_score or (profile.cgpa * 10), 1),
        "projects": min(100, 50 + projects * 12),
        "certifications": min(100, 45 + certs * 15),
        "communication": 70
    }

@router.get("/trust")
def trust(user: User = Depends(require_roles("student", "mentor", "admin")), db: Session = Depends(get_db)):
    profile = profile_for_user(db, user.id)
    if not profile:
        profile = db.query(StudentProfile).first()
        if not profile: raise HTTPException(404, "Student profile not found")
    skills, _ = skill_map(db, profile.id)
    certs = db.query(Certification).filter(Certification.student_id == profile.id).all()
    projects = db.query(Project).filter(Project.student_id == profile.id).all()
    vector = [sum(skills.values()) / max(1, len(skills)), len(certs), len(projects), profile.cgpa, profile.trust_score]
    anomaly = anomaly_score(vector)
    return {
        "trust_score": profile.trust_score,
        "verified_percent": 72,
        "assessed_percent": 14,
        "self_reported_percent": 9,
        "needs_review_percent": 5,
        "anomaly": anomaly
    }

@router.post("/coach")
def coach(payload: CoachRequest, user: User = Depends(require_roles("student", "mentor", "admin")), db: Session = Depends(get_db)):
    profile = profile_for_user(db, user.id)
    if not profile:
        profile = db.query(StudentProfile).first()
        if not profile: raise HTTPException(404, "Student profile not found")
    recs = recommendations(user, db)
    gaps = recs[0]["explanation"]["gaps"][:3] if recs else []
    
    records, subjects, latest_record, active_arrears, academic_score = get_student_academic_context(db, profile.id)
    strengths = extract_academic_strengths(subjects)
    trend = calculate_academic_trend(records)
    cleared_arrears = sum(r.cleared_arrear_count for r in records)
    att = latest_record.attendance_percentage if latest_record else 85.0
    credits_earned = sum(r.credits_earned for r in records)
    
    # Query student alerts
    student_alerts = db.query(AcademicAlert).filter_by(student_id=profile.id, status="Active").all()
    alert_messages = [a.message for a in student_alerts[:2]]
    
    context = {
        "target_role": profile.target_role,
        "match": recs[0]["match_score"] if recs else 0,
        "top_gaps": [g["skill"] for g in gaps],
        "cgpa": profile.cgpa,
        "latest_sgpa": latest_record.sgpa if latest_record else profile.cgpa,
        "arrears": active_arrears,
        "cleared_arrears": cleared_arrears,
        "attendance": att,
        "credits_earned": credits_earned,
        "academic_trend": trend,
        "academic_strengths": strengths,
        "alerts": alert_messages
    }
    return {"answer": coach_answer(payload.message, context), "context": context}

@router.post("/feedback")
def feedback(payload: FeedbackIn, user: User = Depends(require_roles("student", "mentor", "admin")), db: Session = Depends(get_db)):
    profile = profile_for_user(db, user.id)
    if not profile:
        profile = db.query(StudentProfile).first()
        if not profile: raise HTTPException(404, "Student profile not found")
    row = Feedback(student_id=profile.id, rating=payload.rating, useful=payload.useful, comment=payload.comment)
    db.add(row)
    db.commit()
    return {"ok": True}

@router.get("/audit/me")
def my_audit(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [
        {"action": x.action, "module": x.module, "status": x.status, "created_at": x.created_at}
        for x in db.query(AuditLog).filter(AuditLog.actor_user_id == user.id).order_by(desc(AuditLog.created_at)).limit(50).all()
    ]
