import type { ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './layouts/AppShell'
import { Landing } from './pages/Public'
import { PortalSelect } from './pages/PortalSelect'
import { StudentLogin } from './pages/StudentLogin'
import { StudentSignup } from './pages/StudentSignup'
import { MentorLogin } from './pages/MentorLogin'
import { AdminLogin } from './pages/AdminLogin'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import {
  Dashboard,
  Profile,
  Skills,
  Evidence,
  Trust,
  Careers,
  CareerDetail,
  SkillGaps,
  Readiness,
  Roadmap,
  Projects,
  Simulator,
  Coach,
  Mentor,
  Market,
  Progress,
  Feedback,
  ResponsibleAI,
  Privacy,
  AdminAnalytics,
} from './pages/AppPages'
import {
  MentorHub,
  MentorStudents,
  MentorStudent,
  MentorProgress,
  MentorRecommendations,
  MentorCertificates,
  MentorProjects,
  MentorGoals,
  MentorNotes,
  MentorAlerts,
  AdminHub,
  AdminUsersLive,
  AdminMentorsLive,
  AdminAssignmentsLive,
  AdminAuditLive,
  SettingsDispatcher,
} from './pages/RolePages'

function Shell({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}

export default function App() {
  return (
    <Routes>
      {/* Public Pages & Role-Specific Authentication Portals */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PortalSelect />} />
      <Route path="/portals" element={<PortalSelect />} />
      <Route path="/login/student" element={<StudentLogin />} />
      <Route path="/login/mentor" element={<MentorLogin />} />
      <Route path="/login/admin" element={<AdminLogin />} />
      <Route path="/signup" element={<Navigate to="/signup/student" replace />} />
      <Route path="/signup/student" element={<StudentSignup />} />

      {/* Dashboard Alias */}
      <Route path="/dashboard" element={<Navigate to="/app" replace />} />

      {/* Protected Student Workspace Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <Dashboard />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/profile"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <Profile />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/privacy"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <Privacy />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/skills"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <Skills />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/evidence"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <Evidence />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/trust"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <Trust />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/careers"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <Careers />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/career-detail"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <CareerDetail />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/skill-gaps"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <SkillGaps />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/readiness"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <Readiness />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/roadmap"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <Roadmap />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/projects"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <Projects />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/simulator"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <Simulator />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/coach"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <Coach />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/mentor"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <Mentor />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/market"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <Market />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/progress"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <Progress />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/feedback"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <Feedback />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/responsible-ai"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <ResponsibleAI />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/settings"
        element={
          <ProtectedRoute roles={['student', 'mentor', 'admin']}>
            <Shell>
              <SettingsDispatcher />
            </Shell>
          </ProtectedRoute>
        }
      />

      {/* Protected Mentor Hub & Sub-Pages */}
      <Route
        path="/mentor"
        element={
          <ProtectedRoute roles={['mentor', 'admin']}>
            <Shell>
              <MentorHub />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/students"
        element={
          <ProtectedRoute roles={['mentor', 'admin']}>
            <Shell>
              <MentorStudents />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/students/:id"
        element={
          <ProtectedRoute roles={['mentor', 'admin']}>
            <Shell>
              <MentorStudent />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/progress"
        element={
          <ProtectedRoute roles={['mentor', 'admin']}>
            <Shell>
              <MentorProgress />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/recommendations"
        element={
          <ProtectedRoute roles={['mentor', 'admin']}>
            <Shell>
              <MentorRecommendations />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/certificates"
        element={
          <ProtectedRoute roles={['mentor', 'admin']}>
            <Shell>
              <MentorCertificates />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/projects"
        element={
          <ProtectedRoute roles={['mentor', 'admin']}>
            <Shell>
              <MentorProjects />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/goals"
        element={
          <ProtectedRoute roles={['mentor', 'admin']}>
            <Shell>
              <MentorGoals />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/notes"
        element={
          <ProtectedRoute roles={['mentor', 'admin']}>
            <Shell>
              <MentorNotes />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/alerts"
        element={
          <ProtectedRoute roles={['mentor', 'admin']}>
            <Shell>
              <MentorAlerts />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/settings"
        element={
          <ProtectedRoute roles={['mentor', 'admin']}>
            <Shell>
              <SettingsDispatcher />
            </Shell>
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Command Center Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <Shell>
              <AdminHub />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <Shell>
              <AdminUsersLive />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/mentors"
        element={
          <ProtectedRoute roles={['admin']}>
            <Shell>
              <AdminMentorsLive />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assignments"
        element={
          <ProtectedRoute roles={['admin']}>
            <Shell>
              <AdminAssignmentsLive />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute roles={['admin']}>
            <Shell>
              <AdminAnalytics />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit"
        element={
          <ProtectedRoute roles={['admin']}>
            <Shell>
              <AdminAuditLive />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute roles={['admin']}>
            <Shell>
              <AdminAuditLive />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute roles={['admin']}>
            <Shell>
              <SettingsDispatcher />
            </Shell>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
