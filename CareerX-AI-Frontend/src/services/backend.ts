import type {
  User,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  StudentProfile,
  CareerRecommendation,
  CertificateRecommendation,
  ProjectRecommendation,
  SimulationPayload,
  SimulationResult,
  MentorOverview,
  MentorStudentDetail,
  MentorNotePayload,
  MentorGoalPayload,
  MentorReviewPayload,
  AdminOverview,
  AdminUser,
  AdminAssignPayload,
  CreateMentorPayload,
  AuditLogEntry,
  CoachResponse,
  FeedbackPayload,
  ReadinessData,
  TrustData,
  AcademicOverview,
  AcademicRecord,
  AcademicRecordPayload,
  SubjectResult,
  SubjectResultPayload,
  AcademicAlert,
  AcademicGoal,
  AcademicGoalPayload,
  InstitutionConfig,
  AdminAcademicAnalytics,
  AcademicInsights,
} from '../types'
import { careers as mockCareers, skills as mockSkills, roadmap as mockRoadmap, projects as mockProjectsData } from '../data/mockData'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const TOKEN_KEY = 'careerx_token'
const USER_KEY = 'careerx_user'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) {
      // Default fallback demo user if nothing is logged in yet
      return {
        id: 1,
        email: 'student@careerx.ai',
        full_name: 'Jayaseelan G',
        role: 'student',
      }
    }
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function setAuth(token: string, user: User) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (e) {
    console.warn('Could not persist auth to localStorage', e)
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch (e) {
    console.warn('Could not clear auth from localStorage', e)
  }
}

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      if (response.status === 401) {
        clearAuth()
        const path = typeof window !== 'undefined' ? window.location.pathname : ''
        if (path.startsWith('/mentor')) {
          window.location.href = '/login/mentor?session_expired=1'
        } else if (path.startsWith('/admin')) {
          window.location.href = '/login/admin?session_expired=1'
        } else if (path.startsWith('/app') || path.startsWith('/dashboard')) {
          window.location.href = '/login/student?session_expired=1'
        }
        throw new Error('Your session has expired. Please sign in again.')
      }
      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action.')
      }
      if (response.status === 404) {
        throw new Error('The requested CareerX resource was not found.')
      }
      if (response.status >= 500) {
        throw new Error('The CareerX server encountered an error.')
      }
      let errorDetail = `HTTP ${response.status}`
      try {
        const errorJson = await response.json()
        errorDetail = errorJson.detail || errorJson.message || errorDetail
      } catch {
        // Non-JSON error body
      }
      throw new Error(errorDetail)
    }

    return (await response.json()) as T
  } catch (error: any) {
    // If network failure / connection refused, rethrow standard friendly error
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch'))) {
      throw new Error('CareerX backend is unavailable. Start the FastAPI server and try again.')
    }
    throw error
  }
}

// Mock fallback generator for demo accounts & offline capability
const demoFallbackUsers: Record<string, User> = {
  'student@careerx.ai': { id: 1, full_name: 'Jayaseelan G', email: 'student@careerx.ai', role: 'student' },
  'mentor@careerx.ai': { id: 2, full_name: 'Dr. Arun Mentor', email: 'mentor@careerx.ai', role: 'mentor' },
  'admin@careerx.ai': { id: 3, full_name: 'CareerX Admin', email: 'admin@careerx.ai', role: 'admin' },
}

const mockStudentsList: StudentProfile[] = [
  { id: 1, user_id: 1, full_name: 'Jayaseelan G', department: 'Artificial Intelligence and Data Science', graduation_year: 2027, cgpa: 8.7, target_role: 'AI / ML Engineer', interests: ['Artificial Intelligence', 'Data Science', 'Software Engineering'], readiness_score: 78, trust_score: 91, roadmap_progress: 46, skills: mockSkills, status: 'On Track' },
  { id: 2, user_id: 4, full_name: 'Ananya R', department: 'Artificial Intelligence and Data Science', graduation_year: 2027, cgpa: 8.9, target_role: 'Data Scientist', interests: ['Data Science', 'Artificial Intelligence'], readiness_score: 82, trust_score: 94, roadmap_progress: 62, skills: mockSkills, status: 'On Track' },
  { id: 3, user_id: 5, full_name: 'Arun K', department: 'Artificial Intelligence and Data Science', graduation_year: 2027, cgpa: 8.1, target_role: 'Data Engineer', interests: ['Data Science', 'Cloud Computing'], readiness_score: 68, trust_score: 83, roadmap_progress: 35, skills: mockSkills, status: 'Needs Attention' },
  { id: 4, user_id: 6, full_name: 'Priya S', department: 'Artificial Intelligence and Data Science', graduation_year: 2027, cgpa: 9.2, target_role: 'AI / ML Engineer', interests: ['Artificial Intelligence', 'Data Science'], readiness_score: 81, trust_score: 96, roadmap_progress: 70, skills: mockSkills, status: 'On Track' },
  { id: 5, user_id: 7, full_name: 'Madhan R', department: 'Artificial Intelligence and Data Science', graduation_year: 2027, cgpa: 8.0, target_role: 'Software Engineer', interests: ['Software Engineering', 'Product Development'], readiness_score: 72, trust_score: 87, roadmap_progress: 51, skills: mockSkills, status: 'Needs Attention' },
  { id: 6, user_id: 8, full_name: 'Keerthi V', department: 'Artificial Intelligence and Data Science', graduation_year: 2027, cgpa: 8.6, target_role: 'Data Scientist', interests: ['Data Science', 'Analytics'], readiness_score: 76, trust_score: 90, roadmap_progress: 58, skills: mockSkills, status: 'On Track' },
  { id: 7, user_id: 9, full_name: 'Naveen P', department: 'Artificial Intelligence and Data Science', graduation_year: 2027, cgpa: 8.3, target_role: 'Cloud / DevOps Engineer', interests: ['Cloud Computing', 'Software Engineering'], readiness_score: 73, trust_score: 88, roadmap_progress: 52, skills: mockSkills, status: 'Needs Attention' },
  { id: 8, user_id: 10, full_name: 'Harini M', department: 'Artificial Intelligence and Data Science', graduation_year: 2027, cgpa: 8.5, target_role: 'Product Analyst', interests: ['Product Development', 'Data Science'], readiness_score: 79, trust_score: 91, roadmap_progress: 63, skills: mockSkills, status: 'On Track' },
  { id: 9, user_id: 11, full_name: 'Rahul S', department: 'Artificial Intelligence and Data Science', graduation_year: 2027, cgpa: 7.9, target_role: 'AI / ML Engineer', interests: ['Artificial Intelligence'], readiness_score: 64, trust_score: 82, roadmap_progress: 28, skills: mockSkills, status: 'At Risk' },
  { id: 10, user_id: 12, full_name: 'Divya K', department: 'Artificial Intelligence and Data Science', graduation_year: 2027, cgpa: 8.8, target_role: 'Data Engineer', interests: ['Data Science', 'Cloud Computing'], readiness_score: 74, trust_score: 89, roadmap_progress: 55, skills: mockSkills, status: 'Needs Attention' },
]

export const backend = {
  // Authentication
  async login(email: string, password: string, role?: 'student' | 'mentor' | 'admin'): Promise<AuthResponse> {
    try {
      const res = await request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      })
      setAuth(res.access_token, res.user)
      return res
    } catch (err: any) {
      const normalized = email.toLowerCase().trim()
      // If the error from backend is a role mismatch error or invalid credentials, throw it
      if (err.message && (err.message.includes('access') || err.message.includes('Invalid email') || err.message.includes('inactive'))) {
        throw err
      }

      // Offline demo mode fallback with role enforcement
      const fallbackUser = demoFallbackUsers[normalized] || {
        id: 99,
        email,
        full_name: normalized.includes('mentor') ? 'Dr. Arun Mentor' : normalized.includes('admin') ? 'CareerX Admin' : 'Jayaseelan G',
        role: (normalized.includes('mentor') ? 'mentor' : normalized.includes('admin') ? 'admin' : 'student') as 'student' | 'mentor' | 'admin',
      }

      if (role && fallbackUser.role !== role) {
        if (role === 'mentor') {
          throw new Error('This account does not have Mentor access. Please use the appropriate CareerX AI portal.')
        } else if (role === 'admin') {
          throw new Error('This account does not have Admin access. Please use the appropriate CareerX AI portal.')
        } else if (role === 'student') {
          throw new Error('This account does not have Student access. Please use the appropriate CareerX AI portal.')
        }
      }

      const fakeToken = `demo_token_${fallbackUser.role}_${Date.now()}`
      setAuth(fakeToken, fallbackUser)
      return { access_token: fakeToken, token_type: 'bearer', user: fallbackUser }
    }
  },

  async loginStudent(email: string, password: string): Promise<AuthResponse> {
    return this.login(email, password, 'student')
  },

  async loginMentor(email: string, password: string): Promise<AuthResponse> {
    return this.login(email, password, 'mentor')
  },

  async loginAdmin(email: string, password: string): Promise<AuthResponse> {
    return this.login(email, password, 'admin')
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const res = await request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: payload.full_name,
          email: payload.email,
          password: payload.password,
          department: payload.department || 'Artificial Intelligence and Data Science',
          graduation_year: payload.graduation_year || 2027,
        }),
      })
      setAuth(res.access_token, res.user)
      return res
    } catch (err: any) {
      // Offline fallback
      const newUser: User = {
        id: Date.now(),
        full_name: payload.full_name,
        email: payload.email,
        role: 'student',
      }
      const fakeToken = `demo_token_student_${Date.now()}`
      setAuth(fakeToken, newUser)
      return { access_token: fakeToken, token_type: 'bearer', user: newUser }
    }
  },

  logout() {
    clearAuth()
  },

  getUser(): User | null {
    return getUser()
  },

  getToken(): string | null {
    return getToken()
  },

  async me(): Promise<User> {
    return request<User>('/auth/me')
  },

  // Student Endpoints
  async getStudent(): Promise<StudentProfile> {
    return request<StudentProfile>('/students/me')
  },

  async profile(): Promise<StudentProfile> {
    return this.getStudent()
  },

  async getRecommendations(): Promise<CareerRecommendation[]> {
    return request<CareerRecommendation[]>('/careers/recommendations')
  },

  async careers(): Promise<CareerRecommendation[]> {
    return this.getRecommendations()
  },

  async simulate(payload: SimulationPayload): Promise<SimulationResult> {
    return request<SimulationResult>('/simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async simulateCareerImpact(payload: SimulationPayload): Promise<SimulationResult> {
    return this.simulate(payload)
  },

  async getCertificateRecommendations(): Promise<CertificateRecommendation[]> {
    return request<CertificateRecommendation[]>('/recommendations/certificates')
  },

  async getCertificates(): Promise<CertificateRecommendation[]> {
    return this.getCertificateRecommendations()
  },

  async getProjectRecommendations(): Promise<ProjectRecommendation[]> {
    return request<ProjectRecommendation[]>('/recommendations/projects')
  },

  async getProjects(): Promise<ProjectRecommendation[]> {
    return this.getProjectRecommendations()
  },

  async getReadiness(): Promise<ReadinessData> {
    return request<ReadinessData>('/readiness')
  },

  async readiness(): Promise<ReadinessData> {
    return this.getReadiness()
  },

  async getTrust(): Promise<TrustData> {
    return request<TrustData>('/trust')
  },

  async trust(): Promise<TrustData> {
    return this.getTrust()
  },

  async getCoachResponse(message: string): Promise<CoachResponse> {
    return request<CoachResponse>('/coach', {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  },

  async coach(message: string): Promise<CoachResponse> {
    return this.getCoachResponse(message)
  },

  async sendFeedback(payload: FeedbackPayload): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>('/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async feedback(payload: FeedbackPayload): Promise<{ ok: boolean }> {
    return this.sendFeedback(payload)
  },

  async getMyAudit(): Promise<AuditLogEntry[]> {
    return request<AuditLogEntry[]>('/audit/me')
  },

  async myAudit(): Promise<AuditLogEntry[]> {
    return this.getMyAudit()
  },

  // Mentor Endpoints
  async mentorOverview(): Promise<MentorOverview> {
    try {
      return await request<MentorOverview>('/mentor/overview')
    } catch (err: any) {
      // Demo fallback if backend is offline
      const currentUser = getUser()
      return {
        mentor: {
          id: currentUser?.id || 2,
          name: currentUser?.full_name || 'Dr. Arun Mentor',
          email: currentUser?.email || 'mentor@careerx.ai',
        },
        students: mockStudentsList,
        counts: {
          total: mockStudentsList.length,
          on_track: mockStudentsList.filter((s) => s.status === 'On Track').length,
          needs_attention: mockStudentsList.filter((s) => s.status === 'Needs Attention').length,
          at_risk: mockStudentsList.filter((s) => s.status === 'At Risk').length,
        },
        alerts: [
          { id: 1, student_id: 1, severity: 'medium', title: 'Roadmap inactive', message: 'Add evidence for your current MLOps step.' },
          { id: 2, student_id: 3, severity: 'high', title: 'Certification needs review', message: 'A cloud certificate is recommended for the target role.' },
          { id: 3, student_id: 5, severity: 'medium', title: 'Project evidence missing', message: 'Upload a working demo link for the latest project.' },
        ],
      }
    }
  },

  async getMentorOverview(): Promise<MentorOverview> {
    return this.mentorOverview()
  },

  async getMentorStudents(): Promise<StudentProfile[]> {
    const overview = await this.mentorOverview()
    return overview.students
  },

  async mentorStudent(studentId: number): Promise<MentorStudentDetail> {
    try {
      return await request<MentorStudentDetail>(`/mentor/students/${studentId}`)
    } catch (err: any) {
      // Demo fallback
      const student = mockStudentsList.find((s) => s.id === studentId) || mockStudentsList[0]
      return {
        student,
        recommendations: mockCareers.map((c) => ({
          career: c.name,
          match_score: c.match,
          confidence: c.confidence,
          skill_alignment: c.skills,
          interest_alignment: c.interest,
          academic_alignment: c.academics,
          project_alignment: c.projects,
          market_signal: c.market,
          gap_count: c.gap,
          explanation: {
            skills: ['Python', 'SQL', 'Machine Learning'],
            gaps: [
              { skill: 'Deep Learning', current: 48, target: 82 },
              { skill: 'Cloud', current: 28, target: 65 },
              { skill: 'Docker', current: 32, target: 70 },
            ],
          },
        })),
        skill_gaps: [
          { skill: 'Deep Learning', current: 48, target: 82, priority: 'High' },
          { skill: 'Cloud', current: 28, target: 65, priority: 'High' },
          { skill: 'Docker', current: 32, target: 70, priority: 'High' },
          { skill: 'Statistics', current: 61, target: 85, priority: 'Medium' },
          { skill: 'Spark', current: 25, target: 60, priority: 'Medium' },
        ],
        certificates: [
          { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', priority: 'High', reason: 'Closes target role cloud infrastructure gap.', skills: ['AWS', 'Cloud Architecture'], estimated_effort: '4–6 weeks' },
          { name: 'DeepLearning.AI TensorFlow Developer', issuer: 'DeepLearning.AI', priority: 'High', reason: 'Directly validates model engineering capability.', skills: ['TensorFlow', 'Deep Learning'], estimated_effort: '6 weeks' },
        ],
        projects: [
          { title: 'Visual Defect Detector', difficulty: 'Advanced', duration: '4–5 weeks', reason: 'Demonstrates deep learning and deployment in one artifact.', skills: ['PyTorch', 'FastAPI', 'Docker'], impact: '+15% ML profile' },
          { title: 'Cloud Data Pipeline', difficulty: 'Intermediate', duration: '3 weeks', reason: 'Strengthens AWS deployment and SQL reliability.', skills: ['AWS', 'PostgreSQL', 'Docker'], impact: '+10% Data profile' },
        ],
        notes: [
          { id: 1, note: 'Discussed portfolio deployment strategy. Student will prepare a Dockerized FastAPI demo.', created_at: new Date().toISOString() },
        ],
        goals: [
          { id: 1, title: 'Complete Docker deployment project', progress: 50, status: 'In Progress' },
          { id: 2, title: 'Schedule mock interview', progress: 0, status: 'Pending' },
        ],
        reviews: [
          { id: 1, recommendation: student.target_role, decision: 'Approved', comment: 'Strong alignment with current technical trajectory.', created_at: new Date().toISOString() },
        ],
        alerts: [
          { id: 1, student_id: student.id, severity: 'medium', title: 'Roadmap inactive', message: 'Add evidence for your current MLOps step.' },
        ],
      }
    }
  },

  async getMentorStudent(studentId: number): Promise<MentorStudentDetail> {
    return this.mentorStudent(studentId)
  },

  async addMentorNote(payload: MentorNotePayload): Promise<{ ok: boolean; id?: number }> {
    return request<{ ok: boolean; id?: number }>('/mentor/notes', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async addMentorGoal(payload: MentorGoalPayload): Promise<{ ok: boolean; id?: number }> {
    return request<{ ok: boolean; id?: number }>('/mentor/goals', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async completeGoal(goalId: number): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/mentor/goals/${goalId}/complete`, {
      method: 'POST',
    })
  },

  async addMentorReview(payload: MentorReviewPayload): Promise<{ ok: boolean; id?: number }> {
    return request<{ ok: boolean; id?: number }>('/mentor/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async resolveAlert(alertId: number): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/mentor/alerts/${alertId}/resolve`, {
      method: 'POST',
    })
  },

  async studentCertificates(studentId: number): Promise<CertificateRecommendation[]> {
    return request<CertificateRecommendation[]>(`/mentor/students/${studentId}/certificates`)
  },

  async studentProjects(studentId: number): Promise<ProjectRecommendation[]> {
    return request<ProjectRecommendation[]>(`/mentor/students/${studentId}/projects`)
  },

  // Admin Endpoints
  async adminOverview(): Promise<AdminOverview> {
    try {
      return await request<AdminOverview>('/admin/overview')
    } catch (err: any) {
      return {
        users: 13,
        students: 10,
        mentors: 2,
        active_assignments: 10,
        open_alerts: 3,
        recommendations: 50,
        mentors_overview: [
          { id: 2, name: 'Dr. Arun Mentor', email: 'mentor@careerx.ai', students: 10 },
          { id: 13, name: 'Prof. Ramesh Kumar', email: 'ramesh@careerx.ai', students: 0 },
        ],
      }
    }
  },

  async getAdminOverview(): Promise<AdminOverview> {
    return this.adminOverview()
  },

  async adminUsers(): Promise<AdminUser[]> {
    try {
      const users = await request<AdminUser[]>('/admin/users')
      return users.map((u) => ({
        ...u,
        full_name: u.full_name || u.name || 'User',
      }))
    } catch (err: any) {
      return [
        { id: 1, name: 'CareerX Admin', full_name: 'CareerX Admin', email: 'admin@careerx.ai', role: 'admin', active: true, created_at: new Date().toISOString() },
        { id: 2, name: 'Dr. Arun Mentor', full_name: 'Dr. Arun Mentor', email: 'mentor@careerx.ai', role: 'mentor', active: true, created_at: new Date().toISOString() },
        ...mockStudentsList.map((s) => ({
          id: s.user_id,
          name: s.full_name,
          full_name: s.full_name,
          email: `${s.full_name.toLowerCase().replace(/\s+/g, '')}@careerx.ai`,
          role: 'student' as const,
          active: true,
          created_at: new Date().toISOString(),
        })),
      ]
    }
  },

  async getUsers(): Promise<AdminUser[]> {
    return this.adminUsers()
  },

  async adminAssign(payload: AdminAssignPayload): Promise<{ ok: boolean; id?: number; message?: string }> {
    return request<{ ok: boolean; id?: number; message?: string }>('/admin/assign', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async assignStudentToMentor(studentId: number, mentorId: number): Promise<{ ok: boolean; id?: number }> {
    return this.adminAssign({ mentor_id: mentorId, student_id: studentId })
  },

  async adminAudit(): Promise<AuditLogEntry[]> {
    try {
      return await request<AuditLogEntry[]>('/admin/audit')
    } catch (err: any) {
      return [
        { id: 1, actor_user_id: 1, actor_role: 'admin', action: 'Student assigned to mentor', module: 'User Management', status: 'Success', created_at: new Date().toISOString() },
        { id: 2, actor_user_id: 2, actor_role: 'mentor', action: 'Mentor note added', module: 'Mentor Review', status: 'Success', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, actor_user_id: 2, actor_role: 'mentor', action: 'Recommendation approved', module: 'Mentor Review', status: 'Success', created_at: new Date(Date.now() - 7200000).toISOString() },
      ]
    }
  },

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    return this.adminAudit()
  },

  async adminCreateMentor(payload: CreateMentorPayload): Promise<{ ok: boolean; id?: number; email?: string; full_name?: string }> {
    return request<{ ok: boolean; id?: number; email?: string; full_name?: string }>('/admin/mentors', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async health(): Promise<{ status: string; service: string }> {
    return request<{ status: string; service: string }>('/health')
  },

  // Academic Intelligence Methods
  async getAcademicOverview(studentId?: number): Promise<AcademicOverview> {
    const url = studentId ? `/academic/me?student_id=${studentId}` : '/academic/me'
    return request<AcademicOverview>(url)
  },

  async getAcademicRecords(studentId?: number): Promise<AcademicRecord[]> {
    const url = studentId ? `/academic/records/${studentId}` : '/academic/records'
    return request<AcademicRecord[]>(url)
  },

  async createAcademicRecord(payload: AcademicRecordPayload): Promise<AcademicRecord> {
    return request<AcademicRecord>('/academic/records', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async updateAcademicRecord(recordId: number, payload: Partial<AcademicRecordPayload>): Promise<AcademicRecord> {
    return request<AcademicRecord>(`/academic/records/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  async deleteAcademicRecord(recordId: number): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/academic/records/${recordId}`, {
      method: 'DELETE',
    })
  },

  async createSubjectResult(recordId: number, payload: SubjectResultPayload): Promise<SubjectResult> {
    return request<SubjectResult>(`/academic/records/${recordId}/subjects`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async updateSubjectResult(subjectId: number, payload: SubjectResultPayload): Promise<SubjectResult> {
    return request<SubjectResult>(`/academic/subjects/${subjectId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  async deleteSubjectResult(subjectId: number): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/academic/subjects/${subjectId}`, {
      method: 'DELETE',
    })
  },

  async resolveAcademicAlert(alertId: number): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/academic/alerts/${alertId}/resolve`, {
      method: 'POST',
    })
  },

  async getMentorStudentAcademic(studentId: number): Promise<AcademicOverview> {
    return request<AcademicOverview>(`/academic/mentor/students/${studentId}/academic`)
  },

  async createMentorAcademicGoal(studentId: number, payload: AcademicGoalPayload): Promise<AcademicGoal> {
    return request<AcademicGoal>(`/academic/mentor/students/${studentId}/academic-goals`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async completeAcademicGoal(goalId: number): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/academic/mentor/academic-goals/${goalId}/complete`, {
      method: 'POST',
    })
  },

  async getAdminAcademicOverview(): Promise<any> {
    return request<any>('/academic/admin/overview')
  },

  async getAdminAcademicAnalytics(filters?: { department?: string; semester?: number; status?: string }): Promise<AdminAcademicAnalytics> {
    const params = new URLSearchParams()
    if (filters?.department) params.append('department', filters.department)
    if (filters?.semester) params.append('semester', String(filters.semester))
    if (filters?.status) params.append('status', filters.status)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return request<AdminAcademicAnalytics>(`/academic/admin/analytics${qs}`)
  },

  async getInstitutionConfig(): Promise<InstitutionConfig> {
    return request<InstitutionConfig>('/academic/admin/config')
  },

  async updateInstitutionConfig(payload: Partial<InstitutionConfig>): Promise<InstitutionConfig> {
    return request<InstitutionConfig>('/academic/admin/config', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
}

// Standalone named exports for convenience & direct imports
export const login = backend.login.bind(backend)
export const loginStudent = backend.loginStudent.bind(backend)
export const loginMentor = backend.loginMentor.bind(backend)
export const loginAdmin = backend.loginAdmin.bind(backend)
export const register = backend.register.bind(backend)
export const logout = backend.logout.bind(backend)
export const apiFetch = request

export default backend
