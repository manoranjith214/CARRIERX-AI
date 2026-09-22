import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Icon from '../components/Icon'
import { RolePortalCard } from '../components/auth/RolePortalCard'

export function PortalSelect() {
  return (
    <div className="auth-portal-page portal-select-page">
      <div className="auth-portal-bg">
        <div className="auth-portal-glow violet" />
        <div className="auth-portal-glow cyan" />
      </div>

      <header className="auth-portal-nav">
        <Link to="/" className="brand">
          <div className="brand-mark">
            <Icon name="sparkles" size={18} />
          </div>
          <div>
            <strong>CareerX</strong>
            <span>AI</span>
          </div>
        </Link>
        <Link to="/" className="ghost-btn">
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </header>

      <main className="portal-select-main">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="portal-select-container"
        >
          <div className="portal-select-header">
            <div className="hero-kicker">
              <span className="pulse-dot" /> Multi-Role Platform Access
            </div>
            <h1>Welcome to CareerX AI</h1>
            <p>
              Choose your dedicated portal to access tailored career intelligence, mentoring loops,
              or administrative analytics.
            </p>
          </div>

          <div className="role-portals-grid">
            <RolePortalCard
              role="student"
              title="Student Portal"
              subtitle="STUDENT ACCESS"
              description="Build your personalized career trajectory with AI-powered matching, skill gap analysis, and roadmap guidance."
              path="/login/student"
              actionLabel="Student Login"
              icon="grad"
              tone="violet"
              features={[
                '360° Profile & Evidence Center',
                'AI Career Recommendations',
                'Skill Gaps & What-If Simulator',
                'Job Readiness & Copilot Coach',
              ]}
            />

            <RolePortalCard
              role="mentor"
              title="Mentor Portal"
              subtitle="FACULTY & MENTORS"
              description="Monitor assigned students, evaluate skill milestones, set goals, and validate AI-driven career recommendations."
              path="/login/mentor"
              actionLabel="Mentor Login"
              icon="hardhat"
              tone="cyan"
              features={[
                '10-Student Portfolio View',
                'Validate AI Recommendations',
                'Recommend Certs & Projects',
                'Set 30-Day Measurable Goals',
              ]}
            />

            <RolePortalCard
              role="admin"
              title="Admin Portal"
              subtitle="INSTITUTION ADMIN"
              description="Manage platform users, assign students to mentors, monitor institutional capacity, and review system audit logs."
              path="/login/admin"
              actionLabel="Admin Login"
              icon="shield"
              tone="rose"
              features={[
                'User & Role Management',
                'Mentor Capacity & Assignments',
                'Institution-Wide Analytics',
                'Security & Activity Audit Logs',
              ]}
            />
          </div>

          <div className="portal-signup-callout card">
            <div>
              <strong>New student joining CareerX?</strong>
              <p>Create your student profile to start tracking your verified career trajectory.</p>
            </div>
            <Link to="/signup/student" className="primary-btn">
              Create Student Account
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="auth-portal-page-footer">
        <span>© 2026 CareerX AI Inc. Factual career intelligence platform.</span>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/app/privacy">Privacy</Link>
          <Link to="/app/responsible-ai">Responsible AI</Link>
        </div>
      </footer>
    </div>
  )
}
