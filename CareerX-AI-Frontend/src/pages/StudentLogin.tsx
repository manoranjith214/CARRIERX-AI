import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { AuthShell } from '../components/auth/AuthShell'
import Icon from '../components/Icon'
import { backend } from '../services/backend'

export function StudentLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('student@careerx.ai')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    try {
      setBusy(true)
      setError('')
      const data = await backend.loginStudent(email, password)
      navigate('/app')
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please check your credentials and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      currentRole="student"
      title="Welcome back, Student"
      subtitle="Continue your personalized career journey."
      badgeText="STUDENT PORTAL"
      badgeTone="violet"
    >
      <form onSubmit={handleSubmit} className="auth-form-inner">
        <div className="form-fields">
          <label>
            Student Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@careerx.ai"
              required
            />
          </label>

          <label>
            <div className="label-with-action">
              <span>Password</span>
              <span className="text-link-sm" onClick={() => alert('Password reset instructions will be sent to your student email.')}>
                Forgot Password?
              </span>
            </div>
            <div className="input-with-toggle">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
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
        </div>

        {error && (
          <div className="auth-error">
            <Icon name="alert" size={15} />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="primary-btn full big" disabled={busy}>
          <span>{busy ? 'Signing in…' : 'Sign In as Student'}</span>
          <ArrowRight size={16} />
        </button>

        <div className="or">
          <span />
          or
          <span />
        </div>

        <button
          type="button"
          className="social-btn"
          onClick={() => {
            setEmail('student@careerx.ai')
            setPassword('demo123')
          }}
        >
          <div className="google">G</div>
          <span>Continue with Google</span>
        </button>

        {import.meta.env.DEV && (
          <div className="demo-hint-box">
            <strong>Development Demo Credentials</strong>
            <span>student@careerx.ai · password: demo123</span>
          </div>
        )}

        <p className="auth-switch">
          Don't have a student profile?{' '}
          <Link to="/signup/student">Create Student Account</Link>
        </p>
      </form>
    </AuthShell>
  )
}
