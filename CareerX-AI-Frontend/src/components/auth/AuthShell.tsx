import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from '../Icon'

interface AuthShellProps {
  children: ReactNode
  currentRole?: 'student' | 'mentor' | 'admin'
  title?: string
  subtitle?: string
  badgeText?: string
  badgeTone?: 'violet' | 'cyan' | 'rose' | 'green' | 'amber'
  sidePanel?: ReactNode
}

export function AuthShell({
  children,
  currentRole,
  title,
  subtitle,
  badgeText,
  badgeTone = 'violet',
  sidePanel,
}: AuthShellProps) {
  return (
    <div className="auth-portal-page">
      <div className="auth-portal-bg">
        <div className="auth-portal-glow violet" />
        <div className="auth-portal-glow cyan" />
        {currentRole === 'admin' && <div className="auth-portal-glow rose" />}
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
        <Link to="/login" className="text-btn">
          All Portals
        </Link>
      </header>

      <main className="auth-portal-main">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`auth-portal-container ${sidePanel ? 'with-panel' : ''}`}
        >
          <div className="auth-portal-card card">
            {badgeText && (
              <div className="auth-role-pill-wrap">
                <span className={`badge badge-${badgeTone}`}>
                  {currentRole === 'student' && <Icon name="grad" size={13} />}
                  {currentRole === 'mentor' && <Icon name="hardhat" size={13} />}
                  {currentRole === 'admin' && <Icon name="shield" size={13} />}
                  {badgeText}
                </span>
              </div>
            )}

            {title && <h1 className="auth-title">{title}</h1>}
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}

            <div className="auth-body">{children}</div>

            <div className="auth-portal-footer">
              <span className="portal-footer-title">Looking for another portal?</span>
              <div className="portal-switch-links">
                {currentRole !== 'student' && (
                  <Link to="/login/student" className="portal-switch-link">
                    🎓 Student Login
                  </Link>
                )}
                {currentRole !== 'mentor' && (
                  <Link to="/login/mentor" className="portal-switch-link">
                    👨‍🏫 Mentor Portal
                  </Link>
                )}
                {currentRole !== 'admin' && (
                  <Link to="/login/admin" className="portal-switch-link">
                    🛡 Admin Portal
                  </Link>
                )}
              </div>
            </div>
          </div>

          {sidePanel && <div className="auth-side-panel">{sidePanel}</div>}
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
