import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { AuthShell } from '../components/auth/AuthShell'
import Icon from '../components/Icon'
import { backend } from '../services/backend'

export function StudentSignup() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [college, setCollege] = useState('')
  const [department, setDepartment] = useState('Artificial Intelligence and Data Science')
  const [graduationYear, setGraduationYear] = useState('2027')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    try {
      setBusy(true)
      setError('')
      await backend.register({
        full_name: fullName,
        email,
        password,
        department,
        graduation_year: Number(graduationYear),
      })
      navigate('/app')
    } catch (err: any) {
      setError(err.message || 'Unable to register student profile.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      currentRole="student"
      title="Build your career profile"
      subtitle="Start with a structured profile. You can change it anytime."
      badgeText="STUDENT REGISTRATION"
      badgeTone="violet"
    >
      <form onSubmit={handleSubmit} className="auth-form-inner">
        <div className="form-fields">
          <label>
            Full Name
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jayaseelan G"
              required
            />
          </label>

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

          <div className="form-grid-2">
            <label>
              College / University
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="Enter college name"
                required
              />
            </label>

            <label>
              Graduation Year
              <select
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
              >
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
                <option value="2029">2029</option>
              </select>
            </label>
          </div>

          <label>
            Department / Major
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="Artificial Intelligence and Data Science">
                Artificial Intelligence and Data Science
              </option>
              <option value="Computer Science and Engineering">
                Computer Science and Engineering
              </option>
              <option value="Information Technology">Information Technology</option>
              <option value="Data Science & Business Systems">
                Data Science & Business Systems
              </option>
            </select>
          </label>

          <div className="form-grid-2">
            <label>
              Password
              <div className="input-with-toggle">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  required
                />
                <button
                  type="button"
                  className="input-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            <label>
              Confirm Password
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
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

        <button type="submit" className="primary-btn full big" disabled={busy}>
          <span>{busy ? 'Creating profile…' : 'Create CareerX Student Account'}</span>
          <ArrowRight size={16} />
        </button>

        <p className="auth-switch">
          Already have a student account? <Link to="/login/student">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  )
}
