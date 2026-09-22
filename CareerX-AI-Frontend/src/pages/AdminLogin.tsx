import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Lock, ShieldAlert, KeyRound } from 'lucide-react'
import { AuthShell } from '../components/auth/AuthShell'
import Icon from '../components/Icon'
import { backend } from '../services/backend'

export function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@careerx.ai')
  const [password, setPassword] = useState('')
  const [adminId, setAdminId] = useState('ADM-001')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    try {
      setBusy(true)
      setError('')
      await backend.loginAdmin(email, password)
      navigate('/admin')
    } catch (err: any) {
      setError(
        err.message ||
          'Administrative authentication failed. Check credentials and authorization level.'
      )
    } finally {
      setBusy(false)
    }
  }

  const sidePanel = (
    <div className="admin-security-panel card">
      <div className="panel-header">
        <div className="panel-icon rose">
          <Icon name="shield" size={20} />
        </div>
        <div>
          <h3>System Security</h3>
          <span>Admin Command Center</span>
        </div>
      </div>

      <div className="security-notice-box">
        <div className="notice-icon">
          <ShieldAlert size={18} />
        </div>
        <div>
          <strong>Authorized Personnel Only</strong>
          <p>
            This portal is restricted to authorized institution administrators. Administrative actions
            are logged and role-based access controls are enforced.
          </p>
        </div>
      </div>

      <div className="security-audit-preview">
        <div className="audit-preview-title">
          <KeyRound size={14} />
          <span>Institutional Controls</span>
        </div>
        <ul>
          <li>Role-based access enforcement (RBAC)</li>
          <li>Student-to-mentor allocation & capacity quotas</li>
          <li>System telemetry & career recommendation audits</li>
          <li>Audit logging enabled with actor attribution</li>
        </ul>
      </div>

      <div className="panel-callout rose-tone">
        <Lock size={15} />
        <span>Administrative Actions Logged</span>
      </div>
    </div>
  )

  return (
    <AuthShell
      currentRole="admin"
      title="CareerX AI Admin Portal"
      subtitle="System administration and institutional intelligence."
      badgeText="SYSTEM ADMINISTRATOR"
      badgeTone="rose"
      sidePanel={sidePanel}
    >
      <form onSubmit={handleSubmit} className="auth-form-inner">
        <div className="form-fields">
          <label>
            Administrator Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@careerx.ai"
              required
            />
          </label>

          <label>
            <div className="label-with-action">
              <span>Password</span>
              <span
                className="text-link-sm"
                onClick={() =>
                  alert('Please contact root system engineering to initiate an admin recovery flow.')
                }
              >
                Forgot Password?
              </span>
            </div>
            <div className="input-with-toggle">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
              <button
                type="button"
                className="input-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <div className="form-grid-2">
            <label>
              Admin ID <span className="optional-tag">(Optional)</span>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="ADM-XXXX"
              />
            </label>

            <label>
              Verification code <span className="optional-tag">(Optional)</span>
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </label>
          </div>
        </div>

        {error && (
          <div className="auth-error">
            <Icon name="alert" size={15} />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="primary-btn full big tone-rose" disabled={busy}>
          <Lock size={16} />
          <span>{busy ? 'Verifying Admin Clearance…' : 'Secure Admin Login'}</span>
          <ArrowRight size={16} />
        </button>

        {import.meta.env.DEV && (
          <div className="demo-hint-box">
            <strong>Development Demo Credentials</strong>
            <span>admin@careerx.ai · password: demo123</span>
          </div>
        )}

        <div className="mentor-support-links">
          <span>Institutional support inquiries?</span>
          <a
            href="mailto:support@careerx.ai"
            className="text-link"
            onClick={(e) => {
              e.preventDefault()
              alert('Contact support@careerx.ai for root administration access.')
            }}
          >
            Contact System Administrator
          </a>
        </div>
      </form>
    </AuthShell>
  )
}
