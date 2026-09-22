import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { AuthShell } from '../components/auth/AuthShell'
import Icon from '../components/Icon'
import { backend } from '../services/backend'

export function MentorLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('mentor@careerx.ai')
  const [password, setPassword] = useState('')
  const [mentorId, setMentorId] = useState('MTR-8492')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    try {
      setBusy(true)
      setError('')
      await backend.loginMentor(email, password)
      navigate('/mentor')
    } catch (err: any) {
      setError(
        err.message ||
          'Invalid mentor credentials or unauthorized access. Please contact your system administrator.'
      )
    } finally {
      setBusy(false)
    }
  }

  const sidePanel = (
    <div className="mentor-info-panel card">
      <div className="panel-header">
        <div className="panel-icon cyan">
          <Icon name="hardhat" size={20} />
        </div>
        <div>
          <h3>Mentor Access</h3>
          <span>Faculty & Industry Mentorship</span>
        </div>
      </div>

      <p className="panel-lead">
        Empower students with factual evidence validation, customized certifications, and actionable
        30-day goals.
      </p>

      <div className="mentor-access-list">
        {[
          'View 10 assigned students in your portfolio',
          'Track longitudinal readiness and roadmap progress',
          'Review high-priority skill gaps and unlocks',
          'Approve or modify AI certificate recommendations',
          'Assign hands-on portfolio projects',
          'Set measurable 30-day student goals',
          'Review AI career trajectory recommendations',
          'Provide human-in-the-loop mentor feedback',
        ].map((item, idx) => (
          <div key={idx} className="mentor-access-item">
            <CheckCircle2 size={15} className="check-icon" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="panel-callout">
        <ShieldCheck size={16} />
        <span>Mentor accounts are provisioned exclusively by Institutional Administrators.</span>
      </div>
    </div>
  )

  return (
    <AuthShell
      currentRole="mentor"
      title="Mentor Portal"
      subtitle="Guide students. Track progress. Shape careers."
      badgeText="FACULTY & MENTOR ACCESS"
      badgeTone="cyan"
      sidePanel={sidePanel}
    >
      <form onSubmit={handleSubmit} className="auth-form-inner">
        <div className="form-fields">
          <label>
            Mentor Institutional Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. mentor@careerx.ai"
              required
            />
          </label>

          <label>
            <div className="label-with-action">
              <span>Password</span>
              <span
                className="text-link-sm"
                onClick={() =>
                  alert('Please contact your institutional administrator to reset your mentor password.')
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
                placeholder="Enter mentor password"
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
              Mentor ID <span className="optional-tag">(Optional)</span>
              <input
                type="text"
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value)}
                placeholder="MTR-XXXX"
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

        <button type="submit" className="primary-btn full big tone-cyan" disabled={busy}>
          <span>{busy ? 'Verifying access…' : 'Sign In to Mentor Portal'}</span>
          <ArrowRight size={16} />
        </button>

        {import.meta.env.DEV && (
          <div className="demo-hint-box">
            <strong>Development Demo Credentials</strong>
            <span>mentor@careerx.ai · password: demo123</span>
          </div>
        )}

        <div className="mentor-support-links">
          <span>Need mentor onboarding assistance?</span>
          <a
            href="mailto:admin@careerx.ai"
            className="text-link"
            onClick={(e) => {
              e.preventDefault()
              alert('Please contact your administrator at admin@careerx.ai for mentor onboarding.')
            }}
          >
            Contact Administrator
          </a>
        </div>
      </form>
    </AuthShell>
  )
}
