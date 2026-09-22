export interface User {
  id: number
  email: string
  full_name: string
  role: 'student' | 'mentor' | 'admin'
  active?: boolean
  created_at?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
  role?: 'student' | 'mentor' | 'admin'
}

export interface CreateMentorPayload {
  full_name: string
  email: string
  password?: string
  department?: string
  specialization?: string
  max_students?: number
}

export interface RegisterPayload {
  full_name: string
  email: string
  password: string
  department?: string
  graduation_year?: number
}

export interface SkillItem {
  name: string
  level: number
  category: string
  evidence: string
}

export interface StudentProfile {
  id: number
  user_id: number
  full_name: string
  department: string
  graduation_year: number
  cgpa: number
  target_role: string
  interests: string[]
  readiness_score: number
  trust_score: number
  roadmap_progress: number
  skills: SkillItem[]
  status?: 'On Track' | 'Needs Attention' | 'At Risk'
}

export interface CareerExplanation {
  skills?: string[]
  gaps?: { skill: string; current: number; target: number }[]
  market_notes?: string
  [key: string]: any
}

export interface CareerRecommendation {
  career: string
  match_score: number
  confidence: number
  skill_alignment: number
  interest_alignment: number
  academic_alignment: number
  project_alignment: number
  market_signal: string
  gap_count: number
  explanation: CareerExplanation
}

export interface CertificateRecommendation {
  name: string
  issuer: string
  priority: string
  reason: string
  skills: string[]
  estimated_effort: string
}

export interface ProjectRecommendation {
  title: string
  difficulty: string
  duration: string
  reason: string
  skills: string[]
  impact: string
}

export interface SimulationPayload {
  add_skills: string[]
  certifications?: string[]
  projects?: string[]
}

export interface SimulationResult {
  current: CareerRecommendation[]
  after: CareerRecommendation[]
}

export interface MentorAlert {
  id: number
  student_id: number
  severity: 'high' | 'medium' | 'low'
  title: string
  message: string
}

export interface MentorNote {
  id: number
  note: string
  created_at: string
}

export interface MentorGoal {
  id: number
  title: string
  progress: number
  due_date?: string | null
  status?: string
}

export interface MentorReview {
  id: number
  recommendation: string
  decision: string
  comment: string
  created_at: string
}

export interface MentorOverview {
  mentor: {
    id: number
    name: string
    email: string
  }
  students: StudentProfile[]
  counts: {
    total: number
    on_track: number
    needs_attention: number
    at_risk: number
  }
  alerts: MentorAlert[]
}

export interface MentorStudentDetail {
  student: StudentProfile
  recommendations: CareerRecommendation[]
  skill_gaps: {
    skill: string
    current: number
    target: number
    priority: 'High' | 'Medium' | 'Low'
  }[]
  certificates: CertificateRecommendation[]
  projects: ProjectRecommendation[]
  notes: MentorNote[]
  goals: MentorGoal[]
  reviews: MentorReview[]
  alerts: MentorAlert[]
}

export interface MentorNotePayload {
  student_id: number
  note: string
}

export interface MentorGoalPayload {
  student_id: number
  title: string
  progress?: number
  due_date?: string
}

export interface MentorReviewPayload {
  student_id: number
  recommendation: string
  decision: string
  comment?: string
}

export interface AdminMentorOverview {
  id: number
  name: string
  email: string
  students: number
}

export interface AdminOverview {
  users: number
  students: number
  mentors: number
  active_assignments: number
  open_alerts: number
  recommendations: number
  mentors_overview: AdminMentorOverview[]
}

export interface AdminUser {
  id: number
  name: string
  full_name: string
  email: string
  role: 'student' | 'mentor' | 'admin'
  active: boolean
  created_at: string
}

export interface AdminAssignPayload {
  mentor_id: number
  student_id: number
}

export interface AuditLogEntry {
  id?: number
  actor_user_id?: number
  actor_role: string
  action: string
  module: string
  status: string
  metadata?: any
  created_at: string
}

export interface CoachResponse {
  answer: string
  context: Record<string, any>
}

export interface FeedbackPayload {
  rating: number
  useful?: string
  comment?: string
}

export interface ReadinessData {
  overall: number
  technical: number
  academic: number
  projects: number
  certifications: number
  communication: number
}

export interface TrustData {
  trust_score: number
  verified_percent: number
  assessed_percent: number
  self_reported_percent: number
  needs_review_percent: number
  anomaly: number
}

// Academic Intelligence Types
export interface SubjectResult {
  id: number
  academic_record_id: number
  subject_code: string
  subject_name: string
  credits: number
  grade: string
  grade_point: number
  status: 'Passed' | 'Arrear' | 'Cleared' | 'Current'
  category: string
  attendance_percentage: number
  created_at: string
}

export interface SubjectResultPayload {
  subject_code: string
  subject_name: string
  credits?: number
  grade?: string
  grade_point?: number
  status?: 'Passed' | 'Arrear' | 'Cleared' | 'Current'
  category?: string
  attendance_percentage?: number
}

export interface AcademicRecord {
  id: number
  student_id: number
  semester: number
  academic_year: string
  sgpa: number
  cgpa: number
  arrear_count: number
  cleared_arrear_count: number
  credits_registered: number
  credits_earned: number
  attendance_percentage: number
  academic_progress_score: number
  trend: 'Improving' | 'Stable' | 'Declining'
  source: string
  verification_status: string
  created_at: string
  subjects?: SubjectResult[]
}

export interface AcademicRecordPayload {
  student_id?: number
  semester: number
  academic_year?: string
  sgpa: number
  cgpa: number
  arrear_count?: number
  cleared_arrear_count?: number
  credits_registered?: number
  credits_earned?: number
  attendance_percentage?: number
  source?: string
  subjects?: SubjectResultPayload[]
}

export interface AcademicAlert {
  id: number
  student_id: number
  type: string
  severity: 'Info' | 'Warning' | 'Critical'
  message: string
  status: 'Active' | 'Resolved'
  created_at: string
  resolved_at?: string | null
}

export interface AcademicGoal {
  id: number
  student_id: number
  mentor_id: number
  title: string
  description?: string
  target_value?: string
  deadline?: string | null
  priority: 'High' | 'Medium' | 'Low'
  progress: number
  status: 'In Progress' | 'Completed' | 'Pending'
  created_at: string
}

export interface AcademicGoalPayload {
  student_id: number
  title: string
  description?: string
  target_value?: string
  deadline?: string | null
  priority?: 'High' | 'Medium' | 'Low'
  progress?: number
}

export interface AcademicImprovement {
  subject_code: string
  subject_name: string
  current_performance: string
  status: string
  reason: string
  suggested_action: string
  career_target: string
  priority: 'High' | 'Medium' | 'Low'
}

export interface InstitutionConfig {
  id: number
  grading_scale: number
  minimum_attendance: number
  total_credits_required: number
  weights_json: Record<string, number>
  rules_json: Record<string, any>
  updated_at: string
}

export interface AcademicOverview {
  student_id: number
  student_name: string
  department: string
  current_cgpa: number
  latest_sgpa: number
  sgpa_delta: number
  active_arrears: number
  total_arrears_ever: number
  cleared_arrears: number
  credits_registered: number
  credits_earned: number
  credits_remaining: number
  credit_completion_pct: number
  attendance_overall: number
  attendance_current_sem: number
  academic_progress_score: number
  academic_trend: 'Improving' | 'Stable' | 'Declining'
  academic_strengths: string[]
  academic_improvements: AcademicImprovement[]
  alerts: AcademicAlert[]
  goals: AcademicGoal[]
  records: AcademicRecord[]
  config?: InstitutionConfig | null
}

export interface AdminAcademicRosterItem {
  student_id: number
  full_name: string
  email: string
  department: string
  current_semester: number
  cgpa: number
  latest_sgpa: number
  active_arrears: number
  attendance: number
  trend: string
  academic_score: number
  status: 'Needs Attention' | 'Improving' | 'Stable' | 'Strong Progress'
}

export interface AdminAcademicAnalytics {
  filters: {
    department: string
    semester: number | null
    status: string
  }
  summary: {
    total_students: number
    avg_cgpa: number
    avg_sgpa: number
    needs_attention_count: number
    improving_count: number
    strong_progress_count: number
    stable_count: number
  }
  distributions: {
    cgpa: { range: string; count: number }[]
    arrears: { category: string; count: number }[]
    attendance: { range: string; count: number }[]
  }
  department_comparison: { department: string; avg_cgpa: number; students: number }[]
  roster: AdminAcademicRosterItem[]
}

export interface AcademicInsights {
  academic_progress_score: number
  trend: 'Improving' | 'Stable' | 'Declining'
  strengths: string[]
  improvements: AcademicImprovement[]
  critical_warnings: string[]
  recommended_focus_areas: string[]
}
