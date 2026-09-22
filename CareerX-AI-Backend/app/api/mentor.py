
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..db import get_db
from ..models import User, StudentProfile, Skill, StudentSkill, Project, Certification, MentorAssignment, MentorNote, MentorGoal, MentorAlert, MentorReview, AuditLog, AcademicRecord, SubjectResult, AcademicAlert, AcademicGoal
from ..security import require_roles
from ..schemas import MentorNoteIn, MentorGoalIn, MentorReviewIn
from ..api.student import serialize_student, skill_map, recommendations
from ..services.ai_engine import certificate_recommendations, project_recommendations
from ..services.academic_engine import calculate_academic_trend, extract_academic_strengths, extract_academic_improvements
from ..services.career_data import CAREERS

router = APIRouter(prefix="/mentor", tags=["mentor"])

@router.get("/overview")
def overview(mentor=Depends(require_roles("mentor","admin")), db: Session=Depends(get_db)):
    assignments=db.query(MentorAssignment).filter(MentorAssignment.mentor_id==mentor.id, MentorAssignment.status=="active").all()
    students=[]
    for a in assignments:
        profile=db.get(StudentProfile,a.student_id)
        if not profile: continue
        data=serialize_student(db,profile)
        data["status"]="On Track" if data["readiness_score"]>=75 and data["roadmap_progress"]>=40 else ("Needs Attention" if data["readiness_score"]>=60 else "At Risk")
        students.append(data)
    alerts=db.query(MentorAlert).filter(MentorAlert.mentor_id==mentor.id,MentorAlert.resolved==False).order_by(desc(MentorAlert.created_at)).limit(10).all()
    return {
        "mentor":{"id":mentor.id,"name":mentor.full_name,"email":mentor.email},
        "students":students,
        "counts":{"total":len(students),"on_track":sum(s["status"]=="On Track" for s in students),"needs_attention":sum(s["status"]=="Needs Attention" for s in students),"at_risk":sum(s["status"]=="At Risk" for s in students)},
        "alerts":[{"id":a.id,"student_id":a.student_id,"severity":a.severity,"title":a.title,"message":a.message} for a in alerts]
    }

def ensure_assigned(mentor, student_id, db):
    if mentor.role=="admin": return
    ok=db.query(MentorAssignment).filter_by(mentor_id=mentor.id, student_id=student_id, status="active").first()
    if not ok: raise HTTPException(403,"Student is not assigned to this mentor")

@router.get("/students/{student_id}")
def student_detail(student_id:int, mentor=Depends(require_roles("mentor","admin")), db: Session=Depends(get_db)):
    ensure_assigned(mentor,student_id,db)
    profile=db.get(StudentProfile,student_id)
    if not profile: raise HTTPException(404,"Student not found")
    data=serialize_student(db,profile)
    recs=recommendations(db.get(User,profile.user_id),db)
    career=next((c for c in CAREERS if c["name"]==profile.target_role),CAREERS[0])
    skills,_=skill_map(db,profile.id)
    gaps=[s for s,need in career["required_skills"].items() if skills.get(s,0)<need]
    certs=certificate_recommendations(profile.target_role,gaps)
    projects=project_recommendations(profile.target_role,gaps)
    notes=db.query(MentorNote).filter_by(student_id=student_id,mentor_id=mentor.id).order_by(desc(MentorNote.created_at)).limit(20).all() if mentor.role!="admin" else db.query(MentorNote).filter_by(student_id=student_id).order_by(desc(MentorNote.created_at)).limit(20).all()
    goals=db.query(MentorGoal).filter_by(student_id=student_id).order_by(desc(MentorGoal.id)).limit(20).all()
    reviews=db.query(MentorReview).filter_by(student_id=student_id).order_by(desc(MentorReview.created_at)).limit(20).all()
    alerts=db.query(MentorAlert).filter_by(student_id=student_id,resolved=False).all()
    # Academic Intelligence context for mentor
    academic_recs = db.query(AcademicRecord).filter_by(student_id=student_id).order_by(AcademicRecord.semester.asc()).all()
    academic_subs = db.query(SubjectResult).join(AcademicRecord).filter(AcademicRecord.student_id == student_id).all()
    academic_alerts_list = db.query(AcademicAlert).filter_by(student_id=student_id).order_by(desc(AcademicAlert.created_at)).all()
    academic_goals_list = db.query(AcademicGoal).filter_by(student_id=student_id).order_by(desc(AcademicGoal.created_at)).all()
    
    latest_acad = academic_recs[-1] if academic_recs else None
    academic_trend = calculate_academic_trend(academic_recs)
    academic_strengths = extract_academic_strengths(academic_subs)
    academic_improvements = extract_academic_improvements(academic_subs, profile.target_role)

    return {
        "student": data,
        "recommendations": recs[:5],
        "skill_gaps": [{"skill":s,"current":skills.get(s,0),"target":need,"priority":"High" if need-skills.get(s,0)>=30 else "Medium"} for s,need in career["required_skills"].items() if skills.get(s,0)<need],
        "certificates": certs,
        "projects": projects,
        "notes": [{"id":n.id,"note":n.note,"created_at":n.created_at} for n in notes],
        "goals": [{"id":g.id,"title":g.title,"progress":g.progress,"due_date":g.due_date,"status":g.status} for g in goals],
        "reviews": [{"id":r.id,"recommendation":r.recommendation,"decision":r.decision,"comment":r.comment,"created_at":r.created_at} for r in reviews],
        "alerts": [{"id":a.id,"severity":a.severity,"title":a.title,"message":a.message} for a in alerts],
        "academic": {
            "current_cgpa": round(profile.cgpa or (latest_acad.cgpa if latest_acad else 0.0), 2),
            "latest_sgpa": round(latest_acad.sgpa if latest_acad else 0.0, 2),
            "active_arrears": latest_acad.arrear_count if latest_acad else 0,
            "cleared_arrears": sum(r.cleared_arrear_count for r in academic_recs),
            "attendance": round(latest_acad.attendance_percentage, 1) if latest_acad else (round(sum(r.attendance_percentage for r in academic_recs)/len(academic_recs), 1) if academic_recs else 0.0),
            "credits_earned": sum(r.credits_earned for r in academic_recs),
            "credits_registered": sum(r.credits_registered for r in academic_recs),
            "academic_trend": academic_trend,
            "academic_progress_score": latest_acad.academic_progress_score if latest_acad else 0.0,
            "academic_strengths": academic_strengths,
            "academic_improvements": academic_improvements,
            "alerts": [{"id": a.id, "type": a.type, "severity": a.severity, "message": a.message, "status": a.status} for a in academic_alerts_list],
            "goals": [{"id": g.id, "title": g.title, "description": g.description, "target_value": g.target_value, "priority": g.priority, "progress": g.progress, "status": g.status, "deadline": g.deadline} for g in academic_goals_list],
            "subjects": [
                {
                    "id": sub.id,
                    "subject_code": sub.subject_code,
                    "subject_name": sub.subject_name,
                    "credits": sub.credits,
                    "grade": sub.grade,
                    "grade_point": sub.grade_point,
                    "status": sub.status,
                    "category": sub.category,
                    "attendance_percentage": sub.attendance_percentage
                }
                for sub in academic_subs
            ]
        }
    }

@router.post("/notes")
def add_note(payload:MentorNoteIn, mentor=Depends(require_roles("mentor","admin")), db:Session=Depends(get_db)):
    ensure_assigned(mentor,payload.student_id,db)
    row=MentorNote(mentor_id=mentor.id,student_id=payload.student_id,note=payload.note)
    db.add(row); db.add(AuditLog(actor_user_id=mentor.id,actor_role=mentor.role,action="Mentor note added",module="Mentor Review")); db.commit()
    return {"ok":True,"id":row.id}

@router.post("/goals")
def add_goal(payload:MentorGoalIn, mentor=Depends(require_roles("mentor","admin")), db:Session=Depends(get_db)):
    ensure_assigned(mentor,payload.student_id,db)
    row=MentorGoal(mentor_id=mentor.id,student_id=payload.student_id,title=payload.title,progress=payload.progress,due_date=payload.due_date,status="In Progress")
    db.add(row)
    db.add(AuditLog(actor_user_id=mentor.id,actor_role=mentor.role,action=f"Mentor goal created: {payload.title[:30]}",module="Mentor Guidance"))
    db.commit()
    return {"ok":True,"id":row.id}

@router.post("/goals/{goal_id}/complete")
def complete_goal(goal_id:int, mentor=Depends(require_roles("mentor","admin")), db:Session=Depends(get_db)):
    goal=db.get(MentorGoal,goal_id)
    if not goal: raise HTTPException(404,"Goal not found")
    ensure_assigned(mentor,goal.student_id,db)
    goal.status="Completed"
    goal.progress=100
    db.add(AuditLog(actor_user_id=mentor.id,actor_role=mentor.role,action=f"Mentor goal completed: {goal.title[:30]}",module="Mentor Guidance"))
    db.commit()
    return {"ok":True}

@router.post("/reviews")
def add_review(payload:MentorReviewIn, mentor=Depends(require_roles("mentor","admin")), db:Session=Depends(get_db)):
    ensure_assigned(mentor,payload.student_id,db)
    row=MentorReview(mentor_id=mentor.id,student_id=payload.student_id,recommendation=payload.recommendation,decision=payload.decision,comment=payload.comment)
    db.add(row); db.add(AuditLog(actor_user_id=mentor.id,actor_role=mentor.role,action=f"Recommendation {payload.decision.lower()}",module="Mentor Review")); db.commit()
    return {"ok":True,"id":row.id}

@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id:int, mentor=Depends(require_roles("mentor","admin")), db:Session=Depends(get_db)):
    alert=db.get(MentorAlert,alert_id)
    if not alert: raise HTTPException(404,"Alert not found")
    ensure_assigned(mentor,alert.student_id,db)
    alert.resolved=True
    db.add(AuditLog(actor_user_id=mentor.id,actor_role=mentor.role,action=f"Mentor alert resolved: {alert.title[:30]}",module="Mentor Guidance"))
    db.commit()
    return {"ok":True}

@router.get("/students/{student_id}/certificates")
def student_certificates(student_id:int, mentor=Depends(require_roles("mentor","admin")), db:Session=Depends(get_db)):
    detail=student_detail(student_id,mentor,db)
    return detail["certificates"]

@router.get("/students/{student_id}/projects")
def student_projects(student_id:int, mentor=Depends(require_roles("mentor","admin")), db:Session=Depends(get_db)):
    detail=student_detail(student_id,mentor,db)
    return detail["projects"]
