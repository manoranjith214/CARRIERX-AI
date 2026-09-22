from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from ..db import get_db
from ..models import (
    User, StudentProfile, AcademicRecord, SubjectResult, AcademicAlert, AcademicGoal,
    InstitutionConfig, MentorAssignment, AuditLog
)
from ..security import get_current_user, require_roles
from ..schemas import (
    AcademicRecordIn, AcademicRecordUpdateIn, AcademicRecordOut,
    SubjectResultIn, SubjectResultOut, AcademicAlertOut,
    AcademicGoalIn, AcademicGoalOut, AcademicOverviewOut,
    InstitutionConfigIn, InstitutionConfigOut
)
from ..services.academic_engine import (
    calculate_academic_trend, calculate_academic_progress_score,
    extract_academic_strengths, extract_academic_improvements,
    generate_academic_alerts, calculate_career_academic_alignment
)

router = APIRouter(prefix="/academic", tags=["academic"])

def get_or_create_config(db: Session) -> InstitutionConfig:
    config = db.query(InstitutionConfig).first()
    if not config:
        config = InstitutionConfig()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

def get_student_profile(db: Session, user: User, target_student_id: int | None = None) -> StudentProfile:
    if target_student_id:
        profile = db.get(StudentProfile, target_student_id)
        if not profile:
            raise HTTPException(404, "Student profile not found")
        # Role check
        if user.role == "student":
            if profile.user_id != user.id:
                raise HTTPException(403, "You do not have permission to access another student's academic data")
        elif user.role == "mentor":
            assigned = db.query(MentorAssignment).filter_by(mentor_id=user.id, student_id=profile.id, status="active").first()
            if not assigned:
                raise HTTPException(403, "This student is not assigned to your mentorship portfolio")
        return profile
    else:
        profile = db.query(StudentProfile).filter_by(user_id=user.id).first()
        if not profile:
            # Fallback for demo mentor/admin checking default student
            profile = db.query(StudentProfile).first()
            if not profile:
                raise HTTPException(404, "Student profile not found")
        return profile

def serialize_record_with_subjects(db: Session, record: AcademicRecord) -> dict:
    subjects = db.query(SubjectResult).filter_by(academic_record_id=record.id).all()
    return {
        "id": record.id,
        "student_id": record.student_id,
        "semester": record.semester,
        "academic_year": record.academic_year,
        "sgpa": record.sgpa,
        "cgpa": record.cgpa,
        "arrear_count": record.arrear_count,
        "cleared_arrear_count": record.cleared_arrear_count,
        "credits_registered": record.credits_registered,
        "credits_earned": record.credits_earned,
        "attendance_percentage": record.attendance_percentage,
        "academic_progress_score": record.academic_progress_score,
        "trend": record.trend,
        "source": record.source,
        "verification_status": record.verification_status,
        "created_at": record.created_at,
        "subjects": subjects
    }

@router.get("/me", response_model=AcademicOverviewOut)
@router.get("/progress/me", response_model=AcademicOverviewOut)
def get_my_academic_overview(
    student_id: int | None = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_student_profile(db, user, student_id)
    student_user = db.get(User, profile.user_id)
    config = get_or_create_config(db)
    
    records = db.query(AcademicRecord).filter_by(student_id=profile.id).order_by(AcademicRecord.semester.asc()).all()
    serialized_records = [serialize_record_with_subjects(db, r) for r in records]
    
    # Collect all subjects across semesters
    all_subjects = []
    for r in serialized_records:
        all_subjects.extend(r["subjects"])
        
    alerts = db.query(AcademicAlert).filter_by(student_id=profile.id).order_by(desc(AcademicAlert.created_at)).all()
    goals = db.query(AcademicGoal).filter_by(student_id=profile.id).order_by(desc(AcademicGoal.created_at)).all()
    total_req = config.total_credits_required or 160.0

    if not records:
        return {
            "student_id": profile.id,
            "student_name": student_user.full_name if student_user else "Student",
            "department": profile.department,
            "current_cgpa": round(profile.cgpa or 0.0, 2),
            "latest_sgpa": 0.0,
            "sgpa_delta": 0.0,
            "active_arrears": 0,
            "total_arrears_ever": 0,
            "cleared_arrears": 0,
            "credits_registered": 0.0,
            "credits_earned": 0.0,
            "credits_remaining": total_req,
            "credit_completion_pct": 0.0,
            "attendance_overall": 0.0,
            "attendance_current_sem": 0.0,
            "academic_progress_score": 0.0,
            "academic_trend": "Stable",
            "academic_strengths": [],
            "academic_improvements": [],
            "alerts": alerts,
            "goals": goals,
            "records": [],
            "config": config
        }
        
    latest_record = records[-1]
    prev_record = records[-2] if len(records) >= 2 else None
    
    current_cgpa = profile.cgpa or latest_record.cgpa
    latest_sgpa = latest_record.sgpa
    sgpa_delta = (latest_sgpa - prev_record.sgpa) if prev_record else 0.0
    
    active_arrears = sum(r.arrear_count for r in records[-1:])
    total_arrears_ever = sum(r.arrear_count + r.cleared_arrear_count for r in records)
    cleared_arrears = sum(r.cleared_arrear_count for r in records)
    
    credits_registered = sum(r.credits_registered for r in records)
    credits_earned = sum(r.credits_earned for r in records)
    credits_remaining = max(0.0, total_req - credits_earned)
    credit_completion_pct = min(100.0, round((credits_earned / total_req) * 100.0, 1))
    
    attendance_overall = round(sum(r.attendance_percentage for r in records) / len(records), 1)
    attendance_current_sem = latest_record.attendance_percentage
    
    academic_trend = calculate_academic_trend(records)
    progress_score = calculate_academic_progress_score(current_cgpa, records, all_subjects, config)
    
    strengths = extract_academic_strengths(all_subjects)
    improvements = extract_academic_improvements(all_subjects, profile.target_role)
    
    return {
        "student_id": profile.id,
        "student_name": student_user.full_name if student_user else "Student",
        "department": profile.department,
        "current_cgpa": round(current_cgpa, 2),
        "latest_sgpa": round(latest_sgpa, 2),
        "sgpa_delta": round(sgpa_delta, 2),
        "active_arrears": active_arrears,
        "total_arrears_ever": total_arrears_ever,
        "cleared_arrears": cleared_arrears,
        "credits_registered": credits_registered,
        "credits_earned": credits_earned,
        "credits_remaining": credits_remaining,
        "credit_completion_pct": credit_completion_pct,
        "attendance_overall": attendance_overall,
        "attendance_current_sem": attendance_current_sem,
        "academic_progress_score": progress_score,
        "academic_trend": academic_trend,
        "academic_strengths": strengths,
        "academic_improvements": improvements,
        "alerts": alerts,
        "goals": goals,
        "records": serialized_records,
        "config": config
    }

@router.get("/records", response_model=list[AcademicRecordOut])
@router.get("/records/me", response_model=list[AcademicRecordOut])
def get_my_records(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_student_profile(db, user)
    records = db.query(AcademicRecord).filter_by(student_id=profile.id).order_by(AcademicRecord.semester.asc()).all()
    return [serialize_record_with_subjects(db, r) for r in records]

@router.get("/records/{student_id}", response_model=list[AcademicRecordOut])
def get_records_by_student_id(
    student_id: int,
    user: User = Depends(require_roles("student", "mentor", "admin")),
    db: Session = Depends(get_db)
):
    profile = get_student_profile(db, user, student_id)
    records = db.query(AcademicRecord).filter_by(student_id=profile.id).order_by(AcademicRecord.semester.asc()).all()
    return [serialize_record_with_subjects(db, r) for r in records]

@router.post("/records", response_model=AcademicRecordOut)
def create_academic_record(
    payload: AcademicRecordIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_student_profile(db, user, payload.student_id)
    config = get_or_create_config(db)
    
    # Section 15 validation
    if payload.semester < 1:
        raise HTTPException(400, "Semester must be a positive integer (1 or greater)")
    if payload.sgpa < 0.0 or payload.sgpa > config.grading_scale:
        raise HTTPException(400, f"SGPA must be between 0.0 and {config.grading_scale}")
    if payload.cgpa < 0.0 or payload.cgpa > config.grading_scale:
        raise HTTPException(400, f"CGPA must be between 0.0 and {config.grading_scale}")
    if payload.attendance_percentage < 0.0 or payload.attendance_percentage > 100.0:
        raise HTTPException(400, "Attendance percentage must be between 0 and 100")
    if payload.arrear_count < 0:
        raise HTTPException(400, "Arrears count cannot be negative")
    if payload.cleared_arrear_count < 0:
        raise HTTPException(400, "Cleared arrears count cannot be negative")
    if payload.credits_registered < 0.0 or payload.credits_earned < 0.0:
        raise HTTPException(400, "Credits cannot be negative")
    
    # Check for duplicate semester
    existing = db.query(AcademicRecord).filter_by(student_id=profile.id, semester=payload.semester).first()
    if existing:
        raise HTTPException(400, f"Academic record for Semester {payload.semester} already exists. Update it instead.")
        
    trend = "Stable"
    prev_rec = db.query(AcademicRecord).filter_by(student_id=profile.id, semester=payload.semester - 1).first()
    if prev_rec:
        diff = payload.sgpa - prev_rec.sgpa
        trend = "Improving" if diff >= 0.15 else ("Declining" if diff <= -0.15 else "Stable")
        
    record = AcademicRecord(
        student_id=profile.id,
        semester=payload.semester,
        academic_year=payload.academic_year,
        sgpa=payload.sgpa,
        cgpa=payload.cgpa,
        arrear_count=payload.arrear_count,
        cleared_arrear_count=payload.cleared_arrear_count,
        credits_registered=payload.credits_registered,
        credits_earned=payload.credits_earned,
        attendance_percentage=payload.attendance_percentage,
        academic_progress_score=round((payload.cgpa / config.grading_scale) * 100.0, 1),
        academic_trend=trend,
        trend=trend,
        source=payload.source,
        verification_status="Verified" if user.role in ["admin", "mentor"] else "Self Reported",
        created_by=user.id,
        updated_by=user.id
    )
    db.add(record)
    db.flush()
    
    # Add nested subjects if provided
    created_subjects = []
    for s_in in payload.subjects:
        if s_in.credits < 0.0:
            raise HTTPException(400, "Subject credits cannot be negative")
        if s_in.grade_point < 0.0 or s_in.grade_point > config.grading_scale:
            raise HTTPException(400, f"Subject grade point must be between 0 and {config.grading_scale}")
        if s_in.attendance_percentage < 0.0 or s_in.attendance_percentage > 100.0:
            raise HTTPException(400, "Subject attendance percentage must be between 0 and 100")
            
        subj = SubjectResult(
            academic_record_id=record.id,
            student_id=profile.id,
            subject_code=s_in.subject_code,
            subject_name=s_in.subject_name,
            credits=s_in.credits,
            grade=s_in.grade,
            grade_point=s_in.grade_point,
            status=s_in.status,
            category=s_in.category,
            attendance_percentage=s_in.attendance_percentage
        )
        db.add(subj)
        created_subjects.append(subj)
        
    db.flush()
    
    # Recalculate progress score with subjects
    all_recs = db.query(AcademicRecord).filter_by(student_id=profile.id).all()
    all_subs = db.query(SubjectResult).join(AcademicRecord).filter(AcademicRecord.student_id == profile.id).all()
    record.academic_progress_score = calculate_academic_progress_score(payload.cgpa, all_recs, all_subs, config)
    
    # Update profile CGPA
    profile.cgpa = payload.cgpa
    
    # Generate automatic academic alerts
    new_alerts = generate_academic_alerts(profile.id, all_recs, config)
    for a in new_alerts:
        db.add(AcademicAlert(
            student_id=profile.id,
            type=a["type"],
            severity=a["severity"],
            message=a["message"],
            status=a["status"]
        ))
        
    # Write Audit Log
    db.add(AuditLog(
        actor_user_id=user.id,
        actor_role=user.role,
        action=f"Academic record created for Semester {payload.semester}",
        module="Academic Progress",
        metadata_json={"student_id": profile.id, "semester": payload.semester, "sgpa": payload.sgpa, "cgpa": payload.cgpa}
    ))
    db.commit()
    db.refresh(record)
    return serialize_record_with_subjects(db, record)

@router.put("/records/{record_id}", response_model=AcademicRecordOut)
def update_academic_record(
    record_id: int,
    payload: AcademicRecordUpdateIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.get(AcademicRecord, record_id)
    if not record:
        raise HTTPException(404, "Academic record not found")
        
    profile = get_student_profile(db, user, record.student_id)
    config = get_or_create_config(db)
    
    # Validation
    if payload.semester is not None and payload.semester < 1:
        raise HTTPException(400, "Semester must be a positive integer")
    if payload.sgpa is not None and (payload.sgpa < 0.0 or payload.sgpa > config.grading_scale):
        raise HTTPException(400, f"SGPA must be between 0.0 and {config.grading_scale}")
    if payload.cgpa is not None and (payload.cgpa < 0.0 or payload.cgpa > config.grading_scale):
        raise HTTPException(400, f"CGPA must be between 0.0 and {config.grading_scale}")
    if payload.attendance_percentage is not None and (payload.attendance_percentage < 0.0 or payload.attendance_percentage > 100.0):
        raise HTTPException(400, "Attendance percentage must be between 0 and 100")
    if payload.arrear_count is not None and payload.arrear_count < 0:
        raise HTTPException(400, "Arrears count cannot be negative")
    if payload.cleared_arrear_count is not None and payload.cleared_arrear_count < 0:
        raise HTTPException(400, "Cleared arrears count cannot be negative")
    if payload.credits_registered is not None and payload.credits_registered < 0.0:
        raise HTTPException(400, "Credits cannot be negative")
    if payload.credits_earned is not None and payload.credits_earned < 0.0:
        raise HTTPException(400, "Credits cannot be negative")
    
    if payload.semester is not None: record.semester = payload.semester
    if payload.academic_year is not None: record.academic_year = payload.academic_year
    if payload.sgpa is not None: record.sgpa = payload.sgpa
    if payload.cgpa is not None:
        record.cgpa = payload.cgpa
        profile.cgpa = payload.cgpa
    if payload.arrear_count is not None: record.arrear_count = payload.arrear_count
    if payload.cleared_arrear_count is not None: record.cleared_arrear_count = payload.cleared_arrear_count
    if payload.credits_registered is not None: record.credits_registered = payload.credits_registered
    if payload.credits_earned is not None: record.credits_earned = payload.credits_earned
    if payload.attendance_percentage is not None: record.attendance_percentage = payload.attendance_percentage
    if payload.source is not None: record.source = payload.source
    
    record.updated_by = user.id
    record.updated_at = datetime.utcnow()
    
    # Recalculate trend and score
    all_recs = db.query(AcademicRecord).filter_by(student_id=profile.id).order_by(AcademicRecord.semester.asc()).all()
    all_subs = db.query(SubjectResult).join(AcademicRecord).filter(AcademicRecord.student_id == profile.id).all()
    calculated_trend = calculate_academic_trend(all_recs)
    record.trend = calculated_trend
    record.academic_trend = calculated_trend
    record.academic_progress_score = calculate_academic_progress_score(record.cgpa, all_recs, all_subs, config)
    
    db.add(AuditLog(
        actor_user_id=user.id,
        actor_role=user.role,
        action=f"Academic record updated for Semester {record.semester}",
        module="Academic Progress"
    ))
    db.commit()
    db.refresh(record)
    return serialize_record_with_subjects(db, record)

@router.delete("/records/{record_id}")
def delete_academic_record(
    record_id: int,
    user: User = Depends(require_roles("admin", "mentor", "student")),
    db: Session = Depends(get_db)
):
    record = db.get(AcademicRecord, record_id)
    if not record:
        raise HTTPException(404, "Academic record not found")
    profile = get_student_profile(db, user, record.student_id)
    
    db.query(SubjectResult).filter_by(academic_record_id=record.id).delete()
    db.delete(record)
    db.add(AuditLog(
        actor_user_id=user.id,
        actor_role=user.role,
        action=f"Academic record deleted for Semester {record.semester}",
        module="Academic Progress"
    ))
    db.commit()
    return {"ok": True, "message": "Academic record deleted successfully"}

# ==================== SUBJECT RESULTS ====================

@router.get("/records/{record_id}/subjects", response_model=list[SubjectResultOut])
def get_record_subjects(
    record_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.get(AcademicRecord, record_id)
    if not record:
        raise HTTPException(404, "Academic record not found")
    get_student_profile(db, user, record.student_id)
    return db.query(SubjectResult).filter_by(academic_record_id=record.id).all()

@router.post("/records/{record_id}/subjects", response_model=SubjectResultOut)
def add_subject_result(
    record_id: int,
    payload: SubjectResultIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.get(AcademicRecord, record_id)
    if not record:
        raise HTTPException(404, "Academic record not found")
    profile = get_student_profile(db, user, record.student_id)
    config = get_or_create_config(db)
    
    if payload.credits < 0.0:
        raise HTTPException(400, "Credits cannot be negative")
    if payload.grade_point < 0.0 or payload.grade_point > config.grading_scale:
        raise HTTPException(400, f"Grade point must be between 0 and {config.grading_scale}")
    if payload.attendance_percentage < 0.0 or payload.attendance_percentage > 100.0:
        raise HTTPException(400, "Attendance percentage must be between 0 and 100")
        
    subj = SubjectResult(
        academic_record_id=record.id,
        student_id=profile.id,
        subject_code=payload.subject_code,
        subject_name=payload.subject_name,
        credits=payload.credits,
        grade=payload.grade,
        grade_point=payload.grade_point,
        status=payload.status,
        category=payload.category,
        attendance_percentage=payload.attendance_percentage
    )
    db.add(subj)
    db.commit()
    db.refresh(subj)
    return subj

@router.put("/subjects/{subject_id}", response_model=SubjectResultOut)
def update_subject_result(
    subject_id: int,
    payload: SubjectResultIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subj = db.get(SubjectResult, subject_id)
    if not subj:
        raise HTTPException(404, "Subject result not found")
    record = db.get(AcademicRecord, subj.academic_record_id)
    profile = get_student_profile(db, user, record.student_id)
    config = get_or_create_config(db)
    
    if payload.credits < 0.0:
        raise HTTPException(400, "Credits cannot be negative")
    if payload.grade_point < 0.0 or payload.grade_point > config.grading_scale:
        raise HTTPException(400, f"Grade point must be between 0 and {config.grading_scale}")
    if payload.attendance_percentage < 0.0 or payload.attendance_percentage > 100.0:
        raise HTTPException(400, "Attendance percentage must be between 0 and 100")
        
    subj.subject_code = payload.subject_code
    subj.subject_name = payload.subject_name
    subj.credits = payload.credits
    subj.grade = payload.grade
    subj.grade_point = payload.grade_point
    subj.status = payload.status
    subj.category = payload.category
    subj.attendance_percentage = payload.attendance_percentage
    subj.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(subj)
    return subj

@router.delete("/subjects/{subject_id}")
def delete_subject_result(
    subject_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subj = db.get(SubjectResult, subject_id)
    if not subj:
        raise HTTPException(404, "Subject result not found")
    record = db.get(AcademicRecord, subj.academic_record_id)
    profile = get_student_profile(db, user, record.student_id)
    
    db.delete(subj)
    db.commit()
    return {"ok": True, "message": "Subject result deleted"}

# ==================== ALERTS & INSIGHTS ====================

@router.get("/alerts/{student_id}", response_model=list[AcademicAlertOut])
def get_student_alerts(
    student_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_student_profile(db, user, student_id)
    return db.query(AcademicAlert).filter_by(student_id=profile.id).order_by(desc(AcademicAlert.created_at)).all()

@router.post("/alerts/{alert_id}/resolve")
def resolve_academic_alert(
    alert_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.get(AcademicAlert, alert_id)
    if not alert:
        raise HTTPException(404, "Academic alert not found")
    profile = get_student_profile(db, user, alert.student_id)
    alert.status = "Resolved"
    alert.resolved_at = datetime.utcnow()
    alert.resolved_by = user.id
    db.commit()
    return {"ok": True, "message": "Alert marked as resolved"}

@router.get("/insights/{student_id}", response_model=AcademicInsightsOut)
def get_academic_insights(
    student_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_student_profile(db, user, student_id)
    config = get_or_create_config(db)
    
    records = db.query(AcademicRecord).filter_by(student_id=profile.id).order_by(AcademicRecord.semester.asc()).all()
    subjects = db.query(SubjectResult).join(AcademicRecord).filter(AcademicRecord.student_id == profile.id).all()
    latest = records[-1] if records else None
    
    current_cgpa = profile.cgpa or (latest.cgpa if latest else 0.0)
    latest_sgpa = latest.sgpa if latest else 0.0
    trend = calculate_academic_trend(records)
    score = calculate_academic_progress_score(current_cgpa, records, subjects, config)
    alignment_score, alignment_detail = calculate_career_academic_alignment(subjects, current_cgpa, profile.target_role)
    strengths = extract_academic_strengths(subjects)
    improvements = extract_academic_improvements(subjects, profile.target_role)
    alerts = db.query(AcademicAlert).filter_by(student_id=profile.id, status="Active").order_by(desc(AcademicAlert.created_at)).all()
    
    return {
        "student_id": profile.id,
        "target_role": profile.target_role,
        "current_cgpa": round(current_cgpa, 2),
        "latest_sgpa": round(latest_sgpa, 2),
        "academic_trend": trend,
        "academic_progress_score": score,
        "academic_alignment": alignment_score,
        "active_arrears": latest.arrear_count if latest else 0,
        "cleared_arrears": sum(r.cleared_arrear_count for r in records),
        "strengths": strengths,
        "improvements": improvements,
        "alerts": alerts
    }

# ==================== MENTOR ACADEMIC WORKFLOW ====================

@router.get("/mentor/students/{student_id}/academic", response_model=AcademicOverviewOut)
def get_mentor_student_academic(
    student_id: int,
    mentor: User = Depends(require_roles("mentor", "admin")),
    db: Session = Depends(get_db)
):
    return get_my_academic_overview(student_id=student_id, user=mentor, db=db)

@router.post("/mentor/students/{student_id}/academic-goals", response_model=AcademicGoalOut)
def create_mentor_academic_goal(
    student_id: int,
    payload: AcademicGoalIn,
    mentor: User = Depends(require_roles("mentor", "admin")),
    db: Session = Depends(get_db)
):
    profile = get_student_profile(db, mentor, student_id)
    goal = AcademicGoal(
        student_id=profile.id,
        mentor_id=mentor.id,
        title=payload.title,
        description=payload.description,
        target_value=payload.target_value,
        deadline=payload.deadline,
        priority=payload.priority,
        progress=payload.progress,
        status="In Progress"
    )
    db.add(goal)
    db.add(AuditLog(
        actor_user_id=mentor.id,
        actor_role=mentor.role,
        action=f"Academic goal created: {payload.title[:30]}",
        module="Academic Guidance",
        metadata_json={"student_id": profile.id, "goal": payload.title}
    ))
    db.commit()
    db.refresh(goal)
    return goal

@router.post("/mentor/academic-goals/{goal_id}/complete")
def complete_academic_goal(
    goal_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    goal = db.get(AcademicGoal, goal_id)
    if not goal:
        raise HTTPException(404, "Academic goal not found")
    goal.status = "Completed"
    goal.progress = 100.0
    goal.updated_at = datetime.utcnow()
    db.add(AuditLog(
        actor_user_id=user.id,
        actor_role=user.role,
        action=f"Academic goal completed: {goal.title[:30]}",
        module="Academic Guidance"
    ))
    db.commit()
    return {"ok": True, "message": "Academic goal completed"}

# ==================== ADMIN ACADEMIC ANALYTICS ====================

@router.get("/admin/overview")
def get_admin_academic_overview(
    admin: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    students = db.query(StudentProfile).all()
    total_students = len(students)
    if not total_students:
        return {"total_students": 0, "avg_cgpa": 0, "avg_sgpa": 0, "students_with_arrears": 0, "students_clear": 0}
        
    records = db.query(AcademicRecord).all()
    avg_cgpa = round(sum(s.cgpa for s in students) / total_students, 2)
    
    latest_records = []
    for s in students:
        s_recs = [r for r in records if r.student_id == s.id]
        if s_recs:
            latest_records.append(max(s_recs, key=lambda x: x.semester))
            
    avg_sgpa = round(sum(r.sgpa for r in latest_records) / len(latest_records), 2) if latest_records else avg_cgpa
    students_with_arrears = sum(1 for r in latest_records if r.arrear_count > 0)
    students_clear = total_students - students_with_arrears
    avg_attendance = round(sum(r.attendance_percentage for r in latest_records) / len(latest_records), 1) if latest_records else 85.0
    avg_academic_score = round(sum(r.academic_progress_score for r in latest_records) / len(latest_records), 1) if latest_records else 80.0
    
    return {
        "total_students": total_students,
        "avg_cgpa": avg_cgpa,
        "avg_sgpa": avg_sgpa,
        "students_with_arrears": students_with_arrears,
        "students_clear": students_clear,
        "avg_attendance": avg_attendance,
        "avg_academic_score": avg_academic_score,
        "arrear_free_rate": round((students_clear / max(1, total_students)) * 100.0, 1)
    }

@router.get("/admin/analytics")
def get_admin_academic_analytics(
    department: str | None = Query(None),
    batch: int | None = Query(None),
    year: int | None = Query(None),
    semester: int | None = Query(None),
    section: str | None = Query(None),
    mentor_id: int | None = Query(None),
    arrear_status: str | None = Query(None),
    status: str | None = Query(None),
    admin: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    query = db.query(StudentProfile)
    if department and department != "All":
        query = query.filter(StudentProfile.department == department)
    if batch:
        query = query.filter(StudentProfile.graduation_year == batch)
    if year:
        query = query.filter(StudentProfile.graduation_year == year)
    if mentor_id:
        mentor_assigned_ids = [a.student_id for a in db.query(MentorAssignment).filter_by(mentor_id=mentor_id, status="active").all()]
        query = query.filter(StudentProfile.id.in_(mentor_assigned_ids))
        
    students = query.all()
    records = db.query(AcademicRecord).all()
    config = get_or_create_config(db)
    total_req = config.total_credits_required or 160.0
    
    roster = []
    cgpa_dist = {"9.0-10.0": 0, "8.0-8.99": 0, "7.0-7.99": 0, "6.0-6.99": 0, "<6.0": 0}
    sgpa_dist = {"9.0-10.0": 0, "8.0-8.99": 0, "7.0-7.99": 0, "6.0-6.99": 0, "<6.0": 0}
    arrear_dist = {"0 Arrears": 0, "1 Arrear": 0, "2 Arrears": 0, "3+ Arrears": 0}
    attendance_dist = {">=90%": 0, "80-89%": 0, "75-79%": 0, "<75%": 0}
    trend_dist = {"Improving": 0, "Stable": 0, "Declining": 0}
    
    dept_stats: dict[str, list[float]] = {}
    sem_stats: dict[int, list[float]] = {}
    
    for s in students:
        u = db.get(User, s.user_id)
        s_recs = sorted([r for r in records if r.student_id == s.id], key=lambda x: x.semester)
        latest = s_recs[-1] if s_recs else None
        
        if semester and latest and latest.semester != semester:
            continue
            
        cgpa = s.cgpa or (latest.cgpa if latest else 0.0)
        sgpa = latest.sgpa if latest else cgpa
        arrears = latest.arrear_count if latest else 0
        cleared = sum(r.cleared_arrear_count for r in s_recs)
        att = latest.attendance_percentage if latest else 85.0
        trend = latest.trend if latest else "Stable"
        score = latest.academic_progress_score if latest else round((cgpa / config.grading_scale) * 100.0, 1)
        credits_earned = sum(r.credits_earned for r in s_recs)
        credit_pct = min(100.0, round((credits_earned / total_req) * 100.0, 1))
        
        # Filter Arrear Status
        if arrear_status and arrear_status != "All":
            if arrear_status == "No Arrears" and arrears > 0:
                continue
            elif arrear_status == "Has Arrears" and arrears == 0:
                continue
            elif arrear_status == "1 Arrear" and arrears != 1:
                continue
            elif arrear_status == "2+ Arrears" and arrears < 2:
                continue
                
        # Determine Status
        if arrears > 0 or att < config.minimum_attendance or cgpa < 6.5:
            cat_status = "Needs Attention"
        elif trend == "Improving":
            cat_status = "Improving"
        elif cgpa >= 8.5 and arrears == 0:
            cat_status = "Strong Progress"
        else:
            cat_status = "Stable"
            
        if status and status != "All" and cat_status != status:
            continue
            
        # Update distributions
        if cgpa >= 9.0: cgpa_dist["9.0-10.0"] += 1
        elif cgpa >= 8.0: cgpa_dist["8.0-8.99"] += 1
        elif cgpa >= 7.0: cgpa_dist["7.0-7.99"] += 1
        elif cgpa >= 6.0: cgpa_dist["6.0-6.99"] += 1
        else: cgpa_dist["<6.0"] += 1
        
        if sgpa >= 9.0: sgpa_dist["9.0-10.0"] += 1
        elif sgpa >= 8.0: sgpa_dist["8.0-8.99"] += 1
        elif sgpa >= 7.0: sgpa_dist["7.0-7.99"] += 1
        elif sgpa >= 6.0: sgpa_dist["6.0-6.99"] += 1
        else: sgpa_dist["<6.0"] += 1
        
        if arrears == 0: arrear_dist["0 Arrears"] += 1
        elif arrears == 1: arrear_dist["1 Arrear"] += 1
        elif arrears == 2: arrear_dist["2 Arrears"] += 1
        else: arrear_dist["3+ Arrears"] += 1
        
        if att >= 90.0: attendance_dist[">=90%"] += 1
        elif att >= 80.0: attendance_dist["80-89%"] += 1
        elif att >= 75.0: attendance_dist["75-79%"] += 1
        else: attendance_dist["<75%"] += 1
        
        if trend in trend_dist:
            trend_dist[trend] += 1
            
        dept_stats.setdefault(s.department, []).append(cgpa)
        cur_sem = latest.semester if latest else 1
        sem_stats.setdefault(cur_sem, []).append(sgpa)
        
        roster.append({
            "student_id": s.id,
            "full_name": u.full_name if u else "Student",
            "email": u.email if u else "",
            "department": s.department,
            "graduation_year": s.graduation_year,
            "current_semester": cur_sem,
            "cgpa": round(cgpa, 2),
            "latest_sgpa": round(sgpa, 2),
            "active_arrears": arrears,
            "cleared_arrears": cleared,
            "attendance": round(att, 1),
            "credits_earned": credits_earned,
            "credit_completion_pct": credit_pct,
            "trend": trend,
            "academic_score": score,
            "status": cat_status
        })
        
    dept_comparison = [
        {"department": d, "avg_cgpa": round(sum(vals)/len(vals), 2), "students": len(vals)}
        for d, vals in dept_stats.items()
    ]
    sem_comparison = [
        {"semester": f"Sem {sem}", "avg_sgpa": round(sum(vals)/len(vals), 2), "students": len(vals)}
        for sem, vals in sorted(sem_stats.items())
    ]
    
    total_roster = len(roster)
    students_with_arrears = sum(1 for r in roster if r["active_arrears"] > 0)
    students_without_arrears = total_roster - students_with_arrears
    avg_cgpa = round(sum(r["cgpa"] for r in roster) / max(1, total_roster), 2)
    avg_sgpa = round(sum(r["latest_sgpa"] for r in roster) / max(1, total_roster), 2)
    avg_att = round(sum(r["attendance"] for r in roster) / max(1, total_roster), 1)
    avg_score = round(sum(r["academic_score"] for r in roster) / max(1, total_roster), 1)
    avg_credit = round(sum(r["credit_completion_pct"] for r in roster) / max(1, total_roster), 1)
    
    return {
        "filters": {
            "department": department or "All",
            "batch": batch or year or "All",
            "semester": semester or "All",
            "arrear_status": arrear_status or "All",
            "status": status or "All"
        },
        "summary": {
            "total_students": total_roster,
            "avg_cgpa": avg_cgpa,
            "avg_sgpa": avg_sgpa,
            "students_with_arrears": students_with_arrears,
            "students_without_arrears": students_without_arrears,
            "avg_attendance": avg_att,
            "avg_academic_score": avg_score,
            "avg_credit_completion": avg_credit,
            "needs_attention_count": sum(1 for r in roster if r["status"] == "Needs Attention"),
            "improving_count": sum(1 for r in roster if r["status"] == "Improving"),
            "strong_progress_count": sum(1 for r in roster if r["status"] == "Strong Progress"),
            "stable_count": sum(1 for r in roster if r["status"] == "Stable")
        },
        "distributions": {
            "cgpa": [{"range": k, "count": v} for k, v in cgpa_dist.items()],
            "sgpa": [{"range": k, "count": v} for k, v in sgpa_dist.items()],
            "arrears": [{"category": k, "count": v} for k, v in arrear_dist.items()],
            "attendance": [{"range": k, "count": v} for k, v in attendance_dist.items()],
            "trend": [{"category": k, "count": v} for k, v in trend_dist.items()]
        },
        "department_comparison": dept_comparison,
        "semester_comparison": sem_comparison,
        "roster": roster
    }

@router.get("/admin/export")
@router.get("/export/csv")
def export_academic_csv(
    department: str | None = Query(None),
    batch: int | None = Query(None),
    year: int | None = Query(None),
    semester: int | None = Query(None),
    arrear_status: str | None = Query(None),
    status: str | None = Query(None),
    admin: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    analytics = get_admin_academic_analytics(
        department=department,
        batch=batch,
        year=year,
        semester=semester,
        section=None,
        mentor_id=None,
        arrear_status=arrear_status,
        status=status,
        admin=admin,
        db=db
    )
    roster = analytics["roster"]
    
    csv_lines = [
        "Student ID,Full Name,Email,Department,Graduation Year,Semester,CGPA,SGPA,Active Arrears,Cleared Arrears,Attendance,Credits Earned,Credit Completion %,Trend,Academic Progress Score,Status"
    ]
    for r in roster:
        csv_lines.append(
            f"{r['student_id']},\"{r['full_name']}\",{r['email']},\"{r['department']}\",{r['graduation_year']},"
            f"{r['current_semester']},{r['cgpa']},{r['latest_sgpa']},{r['active_arrears']},{r['cleared_arrears']},"
            f"{r['attendance']}%,{r['credits_earned']},{r['credit_completion_pct']}%,{r['trend']},"
            f"{r['academic_score']},{r['status']}"
        )
    csv_data = "\n".join(csv_lines)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=careerx_academic_roster.csv"}
    )

# ==================== CONFIGURATION ====================

@router.get("/admin/config", response_model=InstitutionConfigOut)
def get_institution_config(
    admin: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    return get_or_create_config(db)

@router.put("/admin/config", response_model=InstitutionConfigOut)
def update_institution_config(
    payload: InstitutionConfigIn,
    admin: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    config = get_or_create_config(db)
    config.grading_scale = payload.grading_scale
    config.minimum_attendance = payload.minimum_attendance
    config.total_credits_required = payload.total_credits_required
    if payload.weights_json:
        config.weights_json = payload.weights_json
    if payload.rules_json:
        config.rules_json = payload.rules_json
    config.updated_at = datetime.utcnow()
    
    db.add(AuditLog(
        actor_user_id=admin.id,
        actor_role=admin.role,
        action="Institution academic configuration updated",
        module="Academic Administration"
    ))
    db.commit()
    db.refresh(config)
    return config
