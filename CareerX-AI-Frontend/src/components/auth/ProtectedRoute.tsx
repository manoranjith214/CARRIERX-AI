import { ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { getUser, getToken } from '../../services/backend'
import Icon from '../Icon'

interface ProtectedRouteProps {
  roles: ('student' | 'mentor' | 'admin')[]
  children: ReactNode
}

export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const token = getToken()
  const user = getUser()

  if (!token || !user) {
    // If not authenticated, redirect to the primary role portal
    const defaultLogin = roles.includes('student')
      ? '/login/student'
      : roles.includes('mentor')
      ? '/login/mentor'
      : '/login/admin'
    return <Navigate to={defaultLogin} replace />
  }

  if (!roles.includes(user.role)) {
    // If authenticated with wrong role, show professional access denied view
    return (
      <div className="page-stack">
        <div className="card access-card">
          <div className="access-icon">
            <Icon name="shield" size={32} />
          </div>
          <h2>Access Denied</h2>
          <p>
            You are signed in as <strong>{user.full_name}</strong> (<em>{user.role}</em>). You do
            not have permission to access this portal.
          </p>
          <div className="access-actions">
            {user.role === 'student' && (
              <Link to="/app" className="primary-btn">
                Return to Student Dashboard
              </Link>
            )}
            {user.role === 'mentor' && (
              <Link to="/mentor" className="primary-btn">
                Return to Mentor Hub
              </Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin" className="primary-btn">
                Return to Admin Console
              </Link>
            )}
            <Link to="/login" className="secondary-btn">
              Switch Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
