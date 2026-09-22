
from datetime import datetime, date
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Date, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from .db import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(30), default="student")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, index=True)
    department: Mapped[str] = mapped_column(String(150), default="Artificial Intelligence and Data Science")
    graduation_year: Mapped[int] = mapped_column(Integer, default=2027)
    cgpa: Mapped[float] = mapped_column(Float, default=8.7)
    target_role: Mapped[str] = mapped_column(String(120), default="AI / ML Engineer")
    interests: Mapped[list] = mapped_column(JSON, default=list)
    readiness_score: Mapped[float] = mapped_column(Float, default=78)
    trust_score: Mapped[float] = mapped_column(Float, default=91)
    roadmap_progress: Mapped[float] = mapped_column(Float, default=46)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Skill(Base):
    __tablename__ = "skills"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    category: Mapped[str] = mapped_column(String(80), default="General")

class StudentSkill(Base):
    __tablename__ = "student_skills"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"), index=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"), index=True)
    level: Mapped[float] = mapped_column(Float, default=50)
    evidence: Mapped[str] = mapped_column(String(40), default="Self reported")

class Certification(Base):
    __tablename__ = "certifications"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"), index=True)
    name: Mapped[str] = mapped_column(String(200))
    issuer: Mapped[str] = mapped_column(String(160), default="")
    status: Mapped[str] = mapped_column(String(40), default="Self reported")
    verification_url: Mapped[str] = mapped_column(String(500), default="")
    completed_on: Mapped[date | None] = mapped_column(Date, nullable=True)

class Project(Base):
    __tablename__ = "projects"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    skills: Mapped[list] = mapped_column(JSON, default=list)
    evidence_url: Mapped[str] = mapped_column(String(500), default="")
    status: Mapped[str] = mapped_column(String(40), default="Project evidence")
    impact: Mapped[str] = mapped_column(String(80), default="")

class CareerRole(Base):
    __tablename__ = "career_roles"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(150), unique=True)
    description: Mapped[str] = mapped_column(Text)
    required_skills: Mapped[dict] = mapped_column(JSON, default=dict)
    interest_keywords: Mapped[list] = mapped_column(JSON, default=list)
    market_signal: Mapped[str] = mapped_column(String(30), default="Medium")

class CareerRecommendation(Base):
    __tablename__ = "career_recommendations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"), index=True)
    career_role_id: Mapped[int] = mapped_column(ForeignKey("career_roles.id"))
    match_score: Mapped[float] = mapped_column(Float)
    confidence: Mapped[float] = mapped_column(Float)
    skill_alignment: Mapped[float] = mapped_column(Float)
    interest_alignment: Mapped[float] = mapped_column(Float)
    academic_alignment: Mapped[float] = mapped_column(Float)
    project_alignment: Mapped[float] = mapped_column(Float)
    explanation: Mapped[dict] = mapped_column(JSON, default=dict)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class MentorAssignment(Base):
    __tablename__ = "mentor_assignments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    mentor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"), index=True)
    status: Mapped[str] = mapped_column(String(30), default="active")
    assigned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class MentorNote(Base):
    __tablename__ = "mentor_notes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    mentor_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"))
    note: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class MentorGoal(Base):
    __tablename__ = "mentor_goals"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    mentor_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"))
    title: Mapped[str] = mapped_column(String(250))
    progress: Mapped[float] = mapped_column(Float, default=0)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="active")

class MentorAlert(Base):
    __tablename__ = "mentor_alerts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    mentor_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"))
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    title: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class MentorReview(Base):
    __tablename__ = "mentor_reviews"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    mentor_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"))
    recommendation: Mapped[str] = mapped_column(String(200))
    decision: Mapped[str] = mapped_column(String(40), default="Pending")
    comment: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Feedback(Base):
    __tablename__ = "feedback"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"))
    rating: Mapped[int] = mapped_column(Integer, default=5)
    useful: Mapped[str] = mapped_column(String(40), default="Useful")
    comment: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    actor_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    actor_role: Mapped[str] = mapped_column(String(30))
    action: Mapped[str] = mapped_column(String(200))
    module: Mapped[str] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(30), default="Success")
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class AcademicRecord(Base):
    __tablename__ = "academic_records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"), index=True)
    semester: Mapped[int] = mapped_column(Integer)
    academic_year: Mapped[str] = mapped_column(String(50), default="2024-2025")
    sgpa: Mapped[float] = mapped_column(Float, default=8.0)
    cgpa: Mapped[float] = mapped_column(Float, default=8.0)
    arrear_count: Mapped[int] = mapped_column(Integer, default=0)
    cleared_arrear_count: Mapped[int] = mapped_column(Integer, default=0)
    credits_registered: Mapped[float] = mapped_column(Float, default=24.0)
    credits_earned: Mapped[float] = mapped_column(Float, default=24.0)
    attendance_percentage: Mapped[float] = mapped_column(Float, default=85.0)
    academic_progress_score: Mapped[float] = mapped_column(Float, default=80.0)
    academic_trend: Mapped[str] = mapped_column(String(30), default="Stable")
    trend: Mapped[str] = mapped_column(String(30), default="Stable")
    source: Mapped[str] = mapped_column(String(50), default="institution_import")
    verification_status: Mapped[str] = mapped_column(String(50), default="Verified")
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    updated_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SubjectResult(Base):
    __tablename__ = "subject_results"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    academic_record_id: Mapped[int] = mapped_column(ForeignKey("academic_records.id"), index=True)
    student_id: Mapped[int | None] = mapped_column(ForeignKey("student_profiles.id"), nullable=True, index=True)
    subject_code: Mapped[str] = mapped_column(String(50))
    subject_name: Mapped[str] = mapped_column(String(200))
    credits: Mapped[float] = mapped_column(Float, default=3.0)
    grade: Mapped[str] = mapped_column(String(10), default="A")
    grade_point: Mapped[float] = mapped_column(Float, default=8.0)
    status: Mapped[str] = mapped_column(String(30), default="Passed")
    category: Mapped[str] = mapped_column(String(80), default="General")
    attendance_percentage: Mapped[float] = mapped_column(Float, default=85.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AcademicAlert(Base):
    __tablename__ = "academic_alerts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"), index=True)
    type: Mapped[str] = mapped_column(String(80))
    severity: Mapped[str] = mapped_column(String(30), default="Warning")
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="Active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    resolved_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)

class AcademicGoal(Base):
    __tablename__ = "academic_goals"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"), index=True)
    mentor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(250))
    description: Mapped[str] = mapped_column(Text, default="")
    target_value: Mapped[str] = mapped_column(String(100), default="")
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    priority: Mapped[str] = mapped_column(String(30), default="Medium")
    progress: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(30), default="In Progress")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class InstitutionConfig(Base):
    __tablename__ = "institution_configs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    grading_scale: Mapped[float] = mapped_column(Float, default=10.0)
    minimum_attendance: Mapped[float] = mapped_column(Float, default=75.0)
    total_credits_required: Mapped[float] = mapped_column(Float, default=160.0)
    weights_json: Mapped[dict] = mapped_column(JSON, default=lambda: {
        "cgpa_performance": 0.30,
        "sgpa_trend": 0.20,
        "arrear_status": 0.20,
        "credit_completion": 0.10,
        "attendance": 0.10,
        "subject_performance": 0.10
    })
    rules_json: Mapped[dict] = mapped_column(JSON, default=lambda: {
        "needs_attention_cgpa": 6.5,
        "needs_attention_attendance": 75.0,
        "needs_attention_arrears": 1
    })
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
