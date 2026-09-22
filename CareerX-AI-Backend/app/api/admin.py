
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..db import get_db
from ..models import User, StudentProfile, MentorAssignment, AuditLog, MentorAlert, CareerRecommendation
from ..security import require_roles, hash_password
from ..schemas import AssignStudentIn, CreateMentorIn

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/mentors")
def create_mentor(payload: CreateMentorIn, admin=Depends(require_roles("admin")), db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(400, "Email already registered")
    mentor_user = User(
        email=payload.email.lower(),
        full_name=payload.full_name,
        password_hash=hash_password(payload.password),
        role="mentor",
        is_active=True
    )
    db.add(mentor_user); db.flush()
    db.add(AuditLog(
        actor_user_id=admin.id,
        actor_role="admin",
        action="Mentor account created",
        module="Mentor Management",
        metadata_json={"mentor_id": mentor_user.id, "email": mentor_user.email, "specialization": payload.specialization}
    ))
    db.commit()
    return {"ok": True, "id": mentor_user.id, "email": mentor_user.email, "full_name": mentor_user.full_name}

@router.get("/overview")
def overview(admin=Depends(require_roles("admin")), db:Session=Depends(get_db)):
    users=db.query(User).count()
    students=db.query(StudentProfile).count()
    mentors=db.query(User).filter(User.role=="mentor").count()
    active_assignments=db.query(MentorAssignment).filter(MentorAssignment.status=="active").count()
    alerts=db.query(MentorAlert).filter(MentorAlert.resolved==False).count()
    recommendations=db.query(CareerRecommendation).count()
    mentor_rows=[]
    for mentor in db.query(User).filter(User.role=="mentor").all():
        count=db.query(MentorAssignment).filter_by(mentor_id=mentor.id,status="active").count()
        mentor_rows.append({"id":mentor.id,"name":mentor.full_name,"email":mentor.email,"students":count})
    return {"users":users,"students":students,"mentors":mentors,"active_assignments":active_assignments,"open_alerts":alerts,"recommendations":recommendations,"mentors_overview":mentor_rows}

@router.get("/users")
def users(admin=Depends(require_roles("admin")), db:Session=Depends(get_db)):
    rows=[]
    for u in db.query(User).order_by(User.created_at.desc()).all():
        rows.append({"id":u.id,"name":u.full_name,"full_name":u.full_name,"email":u.email,"role":u.role,"active":u.is_active,"created_at":u.created_at})
    return rows

@router.post("/assign")
def assign(payload:AssignStudentIn, admin=Depends(require_roles("admin")), db:Session=Depends(get_db)):
    mentor=db.get(User,payload.mentor_id)
    student=db.get(StudentProfile,payload.student_id)
    if not mentor or mentor.role!="mentor": raise HTTPException(400,"Mentor not found")
    if not student: raise HTTPException(400,"Student not found")
    existing=db.query(MentorAssignment).filter_by(mentor_id=mentor.id,student_id=student.id,status="active").first()
    if existing: return {"ok":True,"id":existing.id,"message":"Already assigned"}
    capacity=db.query(MentorAssignment).filter_by(mentor_id=mentor.id,status="active").count()
    if capacity >= 10:
        raise HTTPException(400,"Mentor is at the 10-student capacity")
    row=MentorAssignment(mentor_id=mentor.id,student_id=student.id)
    db.add(row); db.add(AuditLog(actor_user_id=admin.id,actor_role="admin",action="Student assigned to mentor",module="User Management",metadata_json={"mentor_id":mentor.id,"student_id":student.id}))
    db.commit()
    return {"ok":True,"id":row.id}

@router.get("/audit")
def audit(admin=Depends(require_roles("admin")), db:Session=Depends(get_db)):
    return [{"id":x.id,"actor_user_id":x.actor_user_id,"actor_role":x.actor_role,"action":x.action,"module":x.module,"status":x.status,"metadata":x.metadata_json,"created_at":x.created_at} for x in db.query(AuditLog).order_by(desc(AuditLog.created_at)).limit(200).all()]
