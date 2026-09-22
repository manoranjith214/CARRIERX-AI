
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field

class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2)
    email: str
    password: str = Field(min_length=6)
    department: str = "Artificial Intelligence and Data Science"
    graduation_year: int = 2027

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str | None = None

class CreateMentorIn(BaseModel):
    full_name: str
    email: str
    password: str = "demo123"
    department: str = "Artificial Intelligence and Data Science"
    specialization: str = "AI / Machine Learning"
    max_students: int = 10

class UserOut(ORMModel):
    id: int
    email: str
    full_name: str
    role: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class SkillOut(BaseModel):
    name: str
    level: float
    category: str
    evidence: str

class StudentOut(BaseModel):
    id: int
    user_id: int
    full_name: str
    department: str
    graduation_year: int
    cgpa: float
    target_role: str
    interests: list[str]
    readiness_score: float
    trust_score: float
    roadmap_progress: float
    career_match: float = 85.0
    skills: list[SkillOut]

class RecommendationOut(BaseModel):
    career: str
    match_score: float
    confidence: float
    skill_alignment: float
    interest_alignment: float
    academic_alignment: float
    project_alignment: float
    certification_alignment: float = 75.0
    assessment_alignment: float = 80.0
    market_signal: str
    gap_count: int
    explanation: dict

class SimulationRequest(BaseModel):
    add_skills: list[str] = []
    certifications: list[str] = []
    projects: list[str] = []

class CertificateRecommendation(BaseModel):
    name: str
    issuer: str
    priority: str
    reason: str
    skills: list[str]
    estimated_effort: str

class ProjectRecommendation(BaseModel):
    title: str
    difficulty: str
    duration: str
    reason: str
    skills: list[str]
    impact: str

class MentorNoteIn(BaseModel):
    student_id: int
    note: str

class MentorGoalIn(BaseModel):
    student_id: int
    title: str
    progress: float = 0
    due_date: date | None = None

class MentorReviewIn(BaseModel):
    student_id: int
    recommendation: str
    decision: str
    comment: str = ""

class AssignStudentIn(BaseModel):
    mentor_id: int
    student_id: int

class FeedbackIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    useful: str = "Useful"
    comment: str = ""

class CoachRequest(BaseModel):
    message: str

class SubjectResultIn(BaseModel):
    subject_code: str
    subject_name: str
    credits: float = Field(ge=0, default=3.0)
    grade: str = "A"
    grade_point: float = Field(ge=0, le=10, default=8.0)
    status: str = "Passed"
    category: str = "General"
    attendance_percentage: float = Field(ge=0, le=100, default=85.0)

class SubjectResultOut(ORMModel):
    id: int
    academic_record_id: int
    student_id: int | None = None
    subject_code: str
    subject_name: str
    credits: float
    grade: str
    grade_point: float
    status: str
    category: str
    attendance_percentage: float
    created_at: datetime

class SubjectResultUpdateIn(BaseModel):
    subject_code: str | None = None
    subject_name: str | None = None
    credits: float | None = None
    grade: str | None = None
    grade_point: float | None = None
    status: str | None = None
    category: str | None = None
    attendance_percentage: float | None = None

class AcademicRecordIn(BaseModel):
    student_id: int | None = None
    semester: int = Field(ge=1, le=12)
    academic_year: str = "2024-2025"
    sgpa: float = Field(ge=0, le=10)
    cgpa: float = Field(ge=0, le=10)
    arrear_count: int = Field(ge=0, default=0)
    cleared_arrear_count: int = Field(ge=0, default=0)
    credits_registered: float = Field(ge=0, default=24.0)
    credits_earned: float = Field(ge=0, default=24.0)
    attendance_percentage: float = Field(ge=0, le=100, default=85.0)
    source: str = "student_entered"
    subjects: list[SubjectResultIn] = []

class AcademicRecordUpdateIn(BaseModel):
    semester: int | None = None
    academic_year: str | None = None
    sgpa: float | None = None
    cgpa: float | None = None
    arrear_count: int | None = None
    cleared_arrear_count: int | None = None
    credits_registered: float | None = None
    credits_earned: float | None = None
    attendance_percentage: float | None = None
    source: str | None = None

class AcademicRecordOut(ORMModel):
    id: int
    student_id: int
    semester: int
    academic_year: str
    sgpa: float
    cgpa: float
    arrear_count: int
    cleared_arrear_count: int
    credits_registered: float
    credits_earned: float
    attendance_percentage: float
    academic_progress_score: float
    academic_trend: str = "Stable"
    trend: str
    source: str
    verification_status: str
    created_at: datetime
    subjects: list[SubjectResultOut] = []

class AcademicAlertOut(ORMModel):
    id: int
    student_id: int
    type: str
    severity: str
    message: str
    status: str
    created_at: datetime
    resolved_at: datetime | None = None

class AcademicGoalIn(BaseModel):
    student_id: int
    title: str
    description: str = ""
    target_value: str = ""
    deadline: date | None = None
    priority: str = "Medium"
    progress: float = 0.0

class AcademicGoalOut(ORMModel):
    id: int
    student_id: int
    mentor_id: int
    title: str
    description: str
    target_value: str
    deadline: date | None = None
    priority: str
    progress: float
    status: str
    created_at: datetime

class InstitutionConfigIn(BaseModel):
    grading_scale: float = 10.0
    minimum_attendance: float = 75.0
    total_credits_required: float = 160.0
    weights_json: dict = {}
    rules_json: dict = {}

class InstitutionConfigOut(ORMModel):
    id: int
    grading_scale: float
    minimum_attendance: float
    total_credits_required: float
    weights_json: dict
    rules_json: dict
    updated_at: datetime

class AcademicOverviewOut(BaseModel):
    student_id: int
    student_name: str
    department: str
    current_cgpa: float
    latest_sgpa: float
    sgpa_delta: float
    active_arrears: int
    total_arrears_ever: int
    cleared_arrears: int
    credits_registered: float
    credits_earned: float
    credits_remaining: float
    credit_completion_pct: float
    attendance_overall: float
    attendance_current_sem: float
    academic_progress_score: float
    academic_trend: str
    academic_strengths: list[str]
    academic_improvements: list[dict]
    alerts: list[AcademicAlertOut]
    goals: list[AcademicGoalOut]
    records: list[AcademicRecordOut]
    config: InstitutionConfigOut | None = None

class AcademicInsightsOut(BaseModel):
    student_id: int
    target_role: str
    current_cgpa: float
    latest_sgpa: float
    academic_trend: str
    academic_progress_score: float
    academic_alignment: float
    active_arrears: int
    cleared_arrears: int
    strengths: list[str]
    improvements: list[dict]
    alerts: list[AcademicAlertOut]

class AdminAcademicAnalyticsOut(BaseModel):
    filters: dict
    summary: dict
    distributions: dict
    department_comparison: list[dict]
    semester_comparison: list[dict] = []
    roster: list[dict]
