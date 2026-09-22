import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Icon from '../components/Icon'
import { Badge, Modal, ProgressBar, SectionHeader, StatCard, Toast } from '../components/UI'
import { backend, getUser } from '../services/backend'

const tooltip = { contentStyle: { background: '#101622', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, color: '#dce4f1' }, labelStyle: { color: '#95a2b7' } }

function Guard({ roles, children }: { roles: string[]; children: ReactNode }) {
  const user = getUser()
  if (!user || !roles.includes(user.role)) {
    return (
      <div className="page-stack">
        <div className="card access-card">
          <div className="access-icon"><Icon name="shield" /></div>
          <h2>Role access required</h2>
          <p>Sign in with a {roles.join(' or ')} account to open this workspace.</p>
          <Link to={`/login/${roles[0] || 'student'}`} className="primary-btn">Sign in</Link>
        </div>
      </div>
    )
  }
  return <>{children}</>
}

const initials = (name?: string) =>
  (name || 'User')
    .split(/\s+/)
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

function ErrorCard({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="page-stack">
      <div className="card error-card">
        <div className="access-icon"><Icon name="alert" /></div>
        <h3>Could not load workspace</h3>
        <p>{message}</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          {onRetry && (
            <button className="primary-btn" onClick={onRetry}>
              Retry Connection
            </button>
          )}
          <Link to="/login" className="secondary-btn">Switch Portal</Link>
        </div>
      </div>
    </div>
  )
}

function LoadingCard() {
  return (
    <div className="page-stack">
      <div className="card loading-card">
        <div className="loading-pulse" />
        <div className="loading-lines"><i /><i /><i /></div>
        <p>Loading CareerX intelligence…</p>
      </div>
    </div>
  )
}

// ==========================================
// 1. MENTOR WORKSPACE PAGES
// ==========================================

export function MentorHub() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const load = () => {
    setError('')
    backend.mentorOverview().then(setData).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  if (error) return <ErrorCard message={error} onRetry={load} />
  if (!data) return <LoadingCard />

  return (
    <Guard roles={['mentor', 'admin']}>
      <div className="page-stack">
        <SectionHeader
          eyebrow="MENTOR HUB"
          title={`Good morning, ${data.mentor.name}`}
          subtitle="Monitor assigned students, guide their next steps, and validate AI-generated recommendations."
          action={<Badge tone="cyan">{data.students.length} students assigned</Badge>}
        />
        <div className="stats-grid four">
          <StatCard label="My students" value={String(data.counts.total)} icon="users" tone="violet" note="Assigned to you" />
          <StatCard label="On track" value={String(data.counts.on_track)} icon="circlecheck" tone="green" note="Healthy progress" />
          <StatCard label="Needs attention" value={String(data.counts.needs_attention)} icon="alert" tone="amber" note="Mentor action" />
          <StatCard label="At risk" value={String(data.counts.at_risk)} icon="shield" tone="rose" note="Review soon" />
        </div>
        <div className="mentor-hub-layout">
          <div className="card">
            <div className="card-head">
              <div>
                <span className="eyebrow">STUDENT PORTFOLIO</span>
                <h3>Your 10-student cohort</h3>
              </div>
              <Link to="/mentor/students" className="text-link">View all {data.students.length} students →</Link>
            </div>
            <div className="mentor-student-grid">
              {data.students.map((s: any) => (
                <Link to={`/mentor/students/${s.id}`} className="mentor-student-card" key={s.id}>
                  <div className="mentor-student-top">
                    <div className="student-avatar">{initials(s.full_name)}</div>
                    <Badge tone={s.status === 'On Track' ? 'green' : s.status === 'Needs Attention' ? 'amber' : 'rose'}>{s.status}</Badge>
                  </div>
                  <h4>{s.full_name}</h4>
                  <p>{s.target_role}</p>
                  <div className="mentor-metrics">
                    <div><span>Match</span><strong>{s.career_match || 92}%</strong></div>
                    <div><span>Readiness</span><strong>{Math.round(s.readiness_score)}%</strong></div>
                    <div><span>Roadmap</span><strong>{Math.round(s.roadmap_progress)}%</strong></div>
                  </div>
                  <ProgressBar value={s.roadmap_progress} tone={s.status === 'On Track' ? 'green' : s.status === 'Needs Attention' ? 'amber' : 'rose'} showValue={false} />
                  <span className="student-card-link">Open progress <Icon name="arrow" size={14} /></span>
                </Link>
              ))}
            </div>
          </div>
          <div className="page-stack">
            <div className="card">
              <div className="card-head">
                <div>
                  <span className="eyebrow">MENTOR ALERTS</span>
                  <h3>What needs your attention</h3>
                </div>
                <Link to="/mentor/alerts"><Badge tone="amber">{data.alerts.length} open</Badge></Link>
              </div>
              {data.alerts.length ? (
                data.alerts.map((a: any) => (
                  <div className="mentor-alert-row" key={a.id}>
                    <div className={`alert-icon ${a.severity}`}><Icon name={a.severity === 'high' ? 'alert' : 'lightbulb'} size={15} /></div>
                    <div>
                      <strong>{a.title}</strong>
                      <p>{a.message}</p>
                      <small>Student #{a.student_id}</small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state mini">
                  <h3>All clear</h3>
                  <p>All mentor alerts are resolved.</p>
                </div>
              )}
            </div>
            <div className="card">
              <div className="card-head">
                <div>
                  <span className="eyebrow">GUIDANCE WORKFLOW</span>
                  <h3>Suggested next steps</h3>
                </div>
              </div>
              {['Review students below 65% readiness', 'Approve or modify certificate suggestions', 'Set measurable 30-day goals', 'Review new project evidence'].map((x, i) => (
                <div className="mentor-action-row" key={x}>
                  <span className="action-index">0{i + 1}</span>
                  <div>
                    <strong>{x}</strong>
                    <p>{i === 0 ? 'Prioritize students whose readiness or roadmap progress has stalled.' : i === 1 ? 'CareerX derives certificates from each student’s skill gaps.' : i === 2 ? 'Goals turn AI recommendations into mentor-led actions.' : 'Evidence improves trust and recommendation confidence.'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Guard>
  )
}

export function MentorStudents() {
  const [data, setData] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const load = () => {
    setError('')
    backend.mentorOverview().then(setData).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  if (error) return <ErrorCard message={error} onRetry={load} />
  if (!data) return <LoadingCard />

  const filtered = data.students.filter((s: any) => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) || s.target_role.toLowerCase().includes(search.toLowerCase())
    if (filter === 'all') return matchSearch
    if (filter === 'ontrack') return matchSearch && s.status === 'On Track'
    if (filter === 'attention') return matchSearch && s.status === 'Needs Attention'
    if (filter === 'atrisk') return matchSearch && s.status === 'At Risk'
    return matchSearch
  })

  return (
    <Guard roles={['mentor', 'admin']}>
      <div className="page-stack">
        <SectionHeader
          eyebrow="MENTOR · STUDENTS"
          title="Assigned Students Portfolio"
          subtitle="Inspect individual student trajectory, career readiness, trust and roadmap progress."
          action={<Badge tone="cyan">{data.students.length} students assigned</Badge>}
        />
        <div className="toolbar">
          <div className="search-box">
            <Icon name="search" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students by name or target role..." />
          </div>
          <div className="filter-pills">
            <button className={filter === 'all' ? 'filter-active' : ''} onClick={() => setFilter('all')}>All ({data.students.length})</button>
            <button className={filter === 'ontrack' ? 'filter-active' : ''} onClick={() => setFilter('ontrack')}>On Track ({data.counts.on_track})</button>
            <button className={filter === 'attention' ? 'filter-active' : ''} onClick={() => setFilter('attention')}>Needs Attention ({data.counts.needs_attention})</button>
            <button className={filter === 'atrisk' ? 'filter-active' : ''} onClick={() => setFilter('atrisk')}>At Risk ({data.counts.at_risk})</button>
          </div>
        </div>
        <div className="mentor-student-grid full-grid">
          {filtered.map((s: any) => (
            <Link to={`/mentor/students/${s.id}`} className="mentor-student-card" key={s.id}>
              <div className="mentor-student-top">
                <div className="student-avatar">{initials(s.full_name)}</div>
                <Badge tone={s.status === 'On Track' ? 'green' : s.status === 'Needs Attention' ? 'amber' : 'rose'}>{s.status}</Badge>
              </div>
              <h4>{s.full_name}</h4>
              <p>{s.target_role}</p>
              <div className="mentor-metrics">
                <div><span>Match</span><strong>{s.career_match || 92}%</strong></div>
                <div><span>Readiness</span><strong>{Math.round(s.readiness_score)}%</strong></div>
                <div><span>Trust</span><strong>{Math.round(s.trust_score)}%</strong></div>
                <div><span>Roadmap</span><strong>{Math.round(s.roadmap_progress)}%</strong></div>
              </div>
              <ProgressBar value={s.roadmap_progress} tone={s.status === 'On Track' ? 'green' : s.status === 'Needs Attention' ? 'amber' : 'rose'} showValue={false} />
              <span className="student-card-link">Open 360° profile <Icon name="arrow" size={14} /></span>
            </Link>
          ))}
          {!filtered.length && (
            <div className="card empty-state" style={{ gridColumn: '1 / -1' }}>
              <h3>No students found</h3>
              <p>Try clearing your search or filter.</p>
            </div>
          )}
        </div>
      </div>
    </Guard>
  )
}

export function MentorStudent() {
  const { id } = useParams()
  const studentId = Number(id)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [goalTitle, setGoalTitle] = useState('')
  const [academicGoalTitle, setAcademicGoalTitle] = useState('')
  const [academicGoalTarget, setAcademicGoalTarget] = useState('')
  const [academicGoalPriority, setAcademicGoalPriority] = useState<'High' | 'Medium' | 'Low'>('High')
  const [academicGoalDeadline, setAcademicGoalDeadline] = useState('')
  const [decision, setDecision] = useState('Approved')
  const [comment, setComment] = useState('')

  const load = () => {
    setError('')
    backend.mentorStudent(studentId).then(setData).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [studentId])

  const submitNote = async () => {
    if (!noteText.trim()) return
    setSubmitting(true)
    try {
      await backend.addMentorNote({ student_id: studentId, note: noteText.trim() })
      setModal(null)
      setNoteText('')
      setToast('Mentor note saved successfully')
      load()
    } catch (e: any) {
      setToast(e.message || 'Unable to save mentor note')
    } finally {
      setSubmitting(false)
    }
  }

  const submitGoal = async () => {
    if (!goalTitle.trim()) return
    setSubmitting(true)
    try {
      await backend.addMentorGoal({ student_id: studentId, title: goalTitle.trim(), progress: 0 })
      setModal(null)
      setGoalTitle('')
      setToast('Mentor goal created successfully')
      load()
    } catch (e: any) {
      setToast(e.message || 'Unable to set student goal')
    } finally {
      setSubmitting(false)
    }
  }

  const submitAcademicGoal = async () => {
    if (!academicGoalTitle.trim()) return
    setSubmitting(true)
    try {
      await backend.createMentorAcademicGoal({
        student_id: studentId,
        title: academicGoalTitle.trim(),
        target_value: academicGoalTarget.trim() || undefined,
        priority: academicGoalPriority,
        deadline: academicGoalDeadline || undefined,
        progress: 0
      })
      setModal(null)
      setAcademicGoalTitle('')
      setAcademicGoalTarget('')
      setToast('Academic target goal assigned successfully')
      load()
    } catch (e: any) {
      setToast(e.message || 'Unable to set academic goal')
    } finally {
      setSubmitting(false)
    }
  }

  const submitReview = async () => {
    setSubmitting(true)
    try {
      await backend.addMentorReview({
        student_id: studentId,
        recommendation: data.student.target_role,
        decision,
        comment: comment.trim() || `${decision} by mentor.`,
      })
      setModal(null)
      setComment('')
      setToast('Mentor review saved successfully')
      load()
    } catch (e: any) {
      setToast(e.message || 'Unable to save mentor review. Please check the backend connection.')
    } finally {
      setSubmitting(false)
    }
  }

  const completeGoalAction = async (goalId: number) => {
    try {
      await backend.completeGoal(goalId)
      setToast('Goal marked as completed')
      load()
    } catch (e: any) {
      setToast(e.message || 'Failed to complete goal')
    }
  }

  const resolveAlertAction = async (alertId: number) => {
    try {
      await backend.resolveAlert(alertId)
      setToast('Alert resolved')
      load()
    } catch (e: any) {
      setToast(e.message || 'Failed to resolve alert')
    }
  }

  if (error) return <ErrorCard message={error} onRetry={load} />
  if (!data) return <LoadingCard />

  const s = data.student
  const acad = data.academic || {}
  const matchScore = s.career_match || data.recommendations?.[0]?.match_score || 92
  const line = [
    { m: 'Month 1', readiness: 51, roadmap: 12 },
    { m: 'Month 2', readiness: 61, roadmap: 24 },
    { m: 'Month 3', readiness: 69, roadmap: 35 },
    { m: 'Current', readiness: Math.round(s.readiness_score), roadmap: Math.round(s.roadmap_progress) },
  ]

  const topStrengths = (s.skills || []).filter((x: any) => x.level >= 75).slice(0, 3).map((x: any) => x.name).join(' · ') || 'Python · Machine Learning · SQL'
  const criticalGaps = (data.skill_gaps || []).slice(0, 3).map((x: any) => x.skill).join(' · ') || 'Deep Learning · Cloud · Docker'
  const nextCert = data.certificates?.[0]?.name || 'Machine Learning Specialization'
  const nextProj = data.projects?.[0]?.title || 'Visual Defect Detector'

  return (
    <Guard roles={['mentor', 'admin']}>
      <div className="page-stack">
        <SectionHeader
          eyebrow="MENTOR · STUDENT PROGRESS"
          title={s.full_name}
          subtitle={`${s.department || 'Artificial Intelligence and Data Science'} · Target: ${s.target_role}`}
          action={
            <div className="inline-actions">
              <button className="secondary-btn" onClick={() => setModal('academicGoal')}><Icon name="plus" size={14} /> Set Academic Goal</button>
              <Link to="/mentor" className="secondary-btn"><Icon name="arrow" size={14} /> Back to students</Link>
            </div>
          }
        />
        <div className="stats-grid four">
          <StatCard label="Career match" value={`${matchScore}%`} icon="target" tone="violet" note="Top role" />
          <StatCard label="Job Readiness" value={`${Math.round(s.readiness_score)}%`} icon="gauge" tone="cyan" note="Readiness index" />
          <StatCard label="CGPA & Academics" value={`${s.cgpa || acad.current_cgpa || 8.65}`} icon="grad" tone={s.cgpa >= 8.5 ? 'green' : 'violet'} note={`${acad.academic_trend || 'Improving'} trend · ${acad.active_arrears || 0} arrears`} />
          <StatCard label="Roadmap Progress" value={`${Math.round(s.roadmap_progress)}%`} icon="route" tone="amber" note="Trajectory" />
        </div>

        {/* Academic Progress & Intelligence Section */}
        <div className="card">
          <div className="card-head">
            <div>
              <span className="eyebrow">ACADEMIC INTELLIGENCE</span>
              <h3>Academic Trajectory & Course Mastery</h3>
            </div>
            <div className="chip-row">
              <Badge tone={acad.academic_trend === 'Improving' ? 'green' : acad.academic_trend === 'Declining' ? 'rose' : 'cyan'}>
                {acad.academic_trend || 'Improving'}
              </Badge>
              <Badge tone={acad.active_arrears === 0 ? 'green' : 'rose'}>
                {acad.active_arrears === 0 ? '0 Active Arrears' : `${acad.active_arrears} Active Arrears`}
              </Badge>
            </div>
          </div>
          <div className="brief-grid" style={{ marginBottom: 16 }}>
            <div>
              <span>Current CGPA</span>
              <strong>{acad.current_cgpa ? acad.current_cgpa.toFixed(2) : s.cgpa ? s.cgpa.toFixed(2) : '8.65'} / 10.0</strong>
            </div>
            <div>
              <span>Latest SGPA</span>
              <strong>{acad.latest_sgpa ? acad.latest_sgpa.toFixed(2) : '8.80'}</strong>
            </div>
            <div>
              <span>Degree Credits Earned</span>
              <strong>{acad.credits_earned || 110} / {acad.credits_registered ? (acad.credits_registered + (acad.credits_remaining || 50)) : 160} ({acad.credit_completion_pct ? acad.credit_completion_pct.toFixed(0) : '68'}%)</strong>
            </div>
            <div>
              <span>Overall Attendance</span>
              <strong>{acad.attendance_overall ? acad.attendance_overall.toFixed(1) : '89.4'}%</strong>
            </div>
          </div>

          {acad.academic_strengths && acad.academic_strengths.length > 0 && (
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, marginBottom: '6px' }}>Top Graded Subject Competencies</div>
              <div className="chip-row">
                {acad.academic_strengths.map((str: string, i: number) => (
                  <Badge key={i} tone="green">{str}</Badge>
                ))}
              </div>
            </div>
          )}

          {acad.academic_improvements && acad.academic_improvements.length > 0 && (
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600, marginBottom: '6px' }}>Course Improvement Opportunities (Linked to {s.target_role})</div>
              {acad.academic_improvements.map((imp: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', padding: '4px 0', borderBottom: i < acad.academic_improvements.length - 1 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                  <span><strong>{imp.subject_code} · {imp.subject_name}</strong>: {imp.suggested_action}</span>
                  <Badge tone={imp.priority === 'High' ? 'rose' : 'amber'}>{imp.priority}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mentor-detail-grid">
          <div className="card chart-card">
            <div className="card-head">
              <div><span className="eyebrow">LONGITUDINAL PROGRESS</span><h3>Readiness & roadmap</h3></div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={line}>
                <CartesianGrid stroke="#252b3a" vertical={false} />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: '#718099', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#718099', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip {...tooltip} />
                <Line dataKey="readiness" stroke="#7c5cfc" strokeWidth={3} dot={false} />
                <Line dataKey="roadmap" stroke="#22d3ee" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="card-head">
              <div><span className="eyebrow">SKILL GAPS</span><h3>Where to guide next</h3></div>
            </div>
            {data.skill_gaps.slice(0, 6).map((g: any) => (
              <div className="mentor-gap" key={g.skill}>
                <div><strong>{g.skill}</strong><span>{Math.round(g.current)} → {Math.round(g.target)}</span></div>
                <ProgressBar value={Math.round(g.current)} tone={g.priority === 'High' ? 'rose' : 'amber'} showValue={false} />
                <Badge tone={g.priority === 'High' ? 'rose' : 'amber'}>{g.priority}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div><span className="eyebrow">AI MENTOR BRIEF</span><h3>What CareerX recommends you discuss</h3></div>
            <Badge tone="violet">Context generated</Badge>
          </div>
          <div className="brief-grid">
            <div><span>Top strengths</span><strong>{topStrengths}</strong></div>
            <div><span>Critical gaps</span><strong>{criticalGaps}</strong></div>
            <div><span>Next certification</span><strong>{nextCert}</strong></div>
            <div><span>Next project</span><strong>{nextProj}</strong></div>
          </div>
        </div>

        <div className="mentor-detail-grid">
          <div className="card">
            <div className="card-head">
              <div><span className="eyebrow">AI CERTIFICATE RECOMMENDATIONS</span><h3>Certifications to discuss</h3></div>
            </div>
            {data.certificates.slice(0, 4).map((c: any) => (
              <div className="recommendation-row" key={c.name}>
                <div className="recommendation-icon"><Icon name="award" /></div>
                <div style={{ flex: 1 }}>
                  <strong>{c.name}</strong>
                  <p>{c.reason}</p>
                  <small>{c.issuer} · {c.estimated_effort}</small>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button className="ghost-btn" style={{ fontSize: 11, height: 28, padding: '0 8px' }} onClick={() => { setComment(`Approved certificate ${c.name}`); setModal('review') }}><Icon name="check" size={12} /> Approve</button>
                    <button className="ghost-btn" style={{ fontSize: 11, height: 28, padding: '0 8px' }} onClick={() => { setComment(`Alternative certificate recommended for ${c.name}`); setModal('review') }}>Suggest Alternative</button>
                    <button className="ghost-btn" style={{ fontSize: 11, height: 28, padding: '0 8px' }} onClick={() => { setNoteText(`Discuss certificate: ${c.name}`); setModal('note') }}>Add Note</button>
                  </div>
                </div>
                <Badge tone={c.priority === 'High' ? 'rose' : 'amber'}>{c.priority}</Badge>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-head">
              <div><span className="eyebrow">AI PROJECT RECOMMENDATIONS</span><h3>Projects that close gaps</h3></div>
            </div>
            {data.projects.slice(0, 4).map((p: any) => (
              <div className="recommendation-row" key={p.title}>
                <div className="recommendation-icon cyan"><Icon name="folder" /></div>
                <div style={{ flex: 1 }}>
                  <strong>{p.title}</strong>
                  <p>{p.reason}</p>
                  <small>{p.duration} · {p.impact}</small>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button className="ghost-btn" style={{ fontSize: 11, height: 28, padding: '0 8px' }} onClick={() => { setGoalTitle(`Complete project: ${p.title}`); setModal('goal') }}><Icon name="check" size={12} /> Recommend</button>
                    <button className="ghost-btn" style={{ fontSize: 11, height: 28, padding: '0 8px' }} onClick={() => { setGoalTitle(`Add ${p.title} to roadmap`); setModal('goal') }}>Add to Roadmap</button>
                  </div>
                </div>
                <Badge tone="cyan">{p.difficulty}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="mentor-action-bar card">
          <div>
            <span className="eyebrow">HUMAN-IN-THE-LOOP</span>
            <h3>Turn AI guidance into mentor guidance</h3>
            <p>Approve, modify or annotate the recommendation and give the student a measurable next step.</p>
          </div>
          <div className="mentor-action-buttons">
            <button className="secondary-btn" onClick={() => setModal('note')}><Icon name="message" /> Add note</button>
            <button className="secondary-btn" onClick={() => setModal('goal')}><Icon name="target" /> Set roadmap goal</button>
            <button className="secondary-btn" onClick={() => setModal('academicGoal')}><Icon name="grad" /> Set academic target</button>
            <button className="primary-btn" onClick={() => setModal('review')}><Icon name="check" /> Review AI recommendation</button>
          </div>
        </div>

        {data.alerts?.length > 0 && (
          <div className="card">
            <div className="card-head">
              <div><span className="eyebrow">ACTIVE ALERTS</span><h3>Student alerts</h3></div>
              <Badge tone="amber">{data.alerts.length} unresolved</Badge>
            </div>
            {data.alerts.map((a: any) => (
              <div className="mentor-alert-row" key={a.id} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className={`alert-icon ${a.severity}`}><Icon name="alert" size={15} /></div>
                  <div><strong>{a.title}</strong><p>{a.message}</p></div>
                </div>
                <button className="secondary-btn" style={{ height: 32, fontSize: 12 }} onClick={() => resolveAlertAction(a.id)}>Resolve Alert</button>
              </div>
            ))}
          </div>
        )}

        {data.goals?.length > 0 && (
          <div className="card">
            <div className="card-head">
              <div><span className="eyebrow">MENTOR GOALS</span><h3>Active & assigned goals</h3></div>
            </div>
            {data.goals.map((g: any) => (
              <div className="goal-row" key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <strong>{g.title}</strong>
                  <span>Status: {g.status} · Progress: {g.progress}%</span>
                  <div className="goal-progress" style={{ maxWidth: 300, marginTop: 4 }}>
                    <ProgressBar value={g.progress} tone={g.status === 'Completed' ? 'green' : 'violet'} showValue={false} />
                  </div>
                </div>
                {g.status !== 'Completed' && (
                  <button className="secondary-btn" style={{ height: 30, fontSize: 11 }} onClick={() => completeGoalAction(g.id)}>
                    <Icon name="check" size={12} /> Mark Complete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {data.reviews?.length > 0 && (
          <div className="card">
            <div className="card-head">
              <div><span className="eyebrow">REVIEW HISTORY</span><h3>Past mentor decisions</h3></div>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Decision</th><th>Recommendation</th><th>Comment</th><th>Date</th></tr></thead>
                <tbody>
                  {data.reviews.map((r: any) => (
                    <tr key={r.id}>
                      <td><Badge tone={r.decision === 'Approved' ? 'green' : r.decision === 'Modified' ? 'amber' : 'rose'}>{r.decision}</Badge></td>
                      <td><strong>{r.recommendation}</strong></td>
                      <td>{r.comment}</td>
                      <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {toast && <Toast message={toast} onClose={() => setToast('')} />}

        <Modal open={modal === 'note'} title="Add mentor note" onClose={() => setModal(null)}>
          <div className="modal-form">
            <label>Private note
              <textarea id="mentor-note" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="What should you remember about this student's progress?" rows={4} />
            </label>
            <button className="primary-btn full" disabled={submitting} onClick={submitNote}>
              {submitting ? 'Saving...' : 'Save note'}
            </button>
          </div>
        </Modal>

        <Modal open={modal === 'goal'} title="Set a student roadmap goal" onClose={() => setModal(null)}>
          <div className="modal-form">
            <label>Goal title
              <input id="mentor-goal" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder="e.g. Complete Docker deployment project" />
            </label>
            <button className="primary-btn full" disabled={submitting} onClick={submitGoal}>
              {submitting ? 'Creating...' : 'Create goal'}
            </button>
          </div>
        </Modal>

        <Modal open={modal === 'academicGoal'} title="Set an Academic Target Goal" onClose={() => setModal(null)}>
          <div className="modal-form">
            <label>Goal Title
              <input value={academicGoalTitle} onChange={(e) => setAcademicGoalTitle(e.target.value)} placeholder="e.g. Achieve SGPA >= 9.0 in Semester 6" />
            </label>
            <label>Target Value
              <input value={academicGoalTarget} onChange={(e) => setAcademicGoalTarget(e.target.value)} placeholder="e.g. SGPA 9.0 or Clear OS Supplementary" />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label>Priority
                <select value={academicGoalPriority} onChange={(e) => setAcademicGoalPriority(e.target.value as any)}>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </label>
              <label>Target Deadline
                <input type="date" value={academicGoalDeadline} onChange={(e) => setAcademicGoalDeadline(e.target.value)} />
              </label>
            </div>
            <button className="primary-btn full" disabled={submitting} onClick={submitAcademicGoal} style={{ marginTop: '12px' }}>
              {submitting ? 'Saving...' : 'Assign Academic Goal'}
            </button>
          </div>
        </Modal>

        <Modal open={modal === 'review'} title="Review AI recommendation" onClose={() => setModal(null)}>
          <div className="modal-form">
            <div className="review-callout">
              <strong>{s.target_role}</strong>
              <span>Current AI recommendation · {matchScore}% match</span>
            </div>
            <label>Mentor decision
              <select id="mentor-decision" value={decision} onChange={(e) => setDecision(e.target.value)}>
                <option value="Approved">Approved</option>
                <option value="Modified">Modified</option>
                <option value="Needs evidence">Needs evidence</option>
                <option value="Rejected">Rejected</option>
              </select>
            </label>
            <label>Mentor comment
              <textarea id="mentor-comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Explain your guidance and feedback for the student..." rows={4} />
            </label>
            <button className="primary-btn full" disabled={submitting} onClick={submitReview}>
              {submitting ? 'Saving...' : 'Save mentor review'}
            </button>
          </div>
        </Modal>
      </div>
    </Guard>
  )
}

export function MentorProgress() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const load = () => {
    setError('')
    backend.mentorOverview().then(setData).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  if (error) return <ErrorCard message={error} onRetry={load} />
  if (!data) return <LoadingCard />

  const chartData = data.students.map((s: any) => ({
    name: s.full_name.split(' ')[0],
    match: s.career_match || 92,
    readiness: Math.round(s.readiness_score),
    roadmap: Math.round(s.roadmap_progress),
  }))

  return (
    <Guard roles={['mentor', 'admin']}>
      <div className="page-stack">
        <SectionHeader
          eyebrow="MENTOR · COHORT PROGRESS"
          title="Cohort Longitudinal Progress"
          subtitle="Compare readiness scores, roadmap completion, and career alignment across your assigned students."
          action={<Badge tone="cyan">{data.students.length} students tracked</Badge>}
        />
        <div className="card chart-card">
          <div className="card-head">
            <div><span className="eyebrow">COHORT BENCHMARK</span><h3>Readiness & Roadmap Comparison</h3></div>
            <div className="chart-legend">
              <span><i className="legend-dot violet" /> Readiness</span>
              <span><i className="legend-dot cyan" /> Roadmap</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#252b3a" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#718099', fontSize: 12 }} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#718099', fontSize: 12 }} />
              <Tooltip {...tooltip} />
              <Bar dataKey="readiness" fill="#7c5cfc" radius={[6, 6, 0, 0]} barSize={20} />
              <Bar dataKey="roadmap" fill="#22d3ee" radius={[6, 6, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-head">
            <div><span className="eyebrow">COHORT MATRIX</span><h3>Student status & readiness distribution</h3></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Student</th><th>Target Role</th><th>Match</th><th>Readiness</th><th>Trust</th><th>Roadmap</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {data.students.map((s: any) => (
                  <tr key={s.id}>
                    <td><div className="student-cell"><div className="avatar small">{initials(s.full_name)}</div><strong>{s.full_name}</strong></div></td>
                    <td>{s.target_role}</td>
                    <td><strong>{s.career_match || 92}%</strong></td>
                    <td>{Math.round(s.readiness_score)}%</td>
                    <td>{Math.round(s.trust_score)}%</td>
                    <td><ProgressBar value={s.roadmap_progress} showValue={false} tone={s.status === 'On Track' ? 'green' : s.status === 'Needs Attention' ? 'amber' : 'rose'} /></td>
                    <td><Badge tone={s.status === 'On Track' ? 'green' : s.status === 'Needs Attention' ? 'amber' : 'rose'}>{s.status}</Badge></td>
                    <td><Link to={`/mentor/students/${s.id}`} className="secondary-btn" style={{ fontSize: 11, padding: '4px 8px' }}>Open <Icon name="arrow" size={12} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Guard>
  )
}

export function MentorRecommendations() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [reviewModal, setReviewModal] = useState(false)
  const [decision, setDecision] = useState('Approved')
  const [comment, setComment] = useState('')
  const [toast, setToast] = useState('')

  const load = () => {
    setError('')
    backend.mentorOverview().then(setData).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  const handleReviewSave = async () => {
    if (!selectedStudent) return
    try {
      await backend.addMentorReview({
        student_id: selectedStudent.id,
        recommendation: selectedStudent.target_role,
        decision,
        comment: comment.trim() || `${decision} by mentor.`,
      })
      setReviewModal(false)
      setComment('')
      setToast(`Recommendation review saved for ${selectedStudent.full_name}`)
      load()
    } catch (e: any) {
      setToast(e.message || 'Failed to save review')
    }
  }

  if (error) return <ErrorCard message={error} onRetry={load} />
  if (!data) return <LoadingCard />

  return (
    <Guard roles={['mentor', 'admin']}>
      <div className="page-stack">
        <SectionHeader
          eyebrow="MENTOR · RECOMMENDATIONS"
          title="Review AI Recommendations"
          subtitle="Validate, modify, or annotate AI career and course suggestions for your cohort."
          action={<Badge tone="violet">Human in the Loop</Badge>}
        />
        <div className="card">
          <div className="card-head">
            <div><span className="eyebrow">QUEUE</span><h3>Cohort Career Recommendations</h3></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Target Role</th><th>Match</th><th>Readiness</th><th>Status</th><th>Review Action</th></tr></thead>
              <tbody>
                {data.students.map((s: any) => (
                  <tr key={s.id}>
                    <td><div className="student-cell"><div className="avatar small">{initials(s.full_name)}</div><strong>{s.full_name}</strong></div></td>
                    <td><Badge tone="violet">{s.target_role}</Badge></td>
                    <td><strong>{s.career_match || 92}%</strong></td>
                    <td>{Math.round(s.readiness_score)}%</td>
                    <td><Badge tone={s.status === 'On Track' ? 'green' : s.status === 'Needs Attention' ? 'amber' : 'rose'}>{s.status}</Badge></td>
                    <td>
                      <button className="primary-btn" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => { setSelectedStudent(s); setReviewModal(true) }}>
                        <Icon name="check" size={12} /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {toast && <Toast message={toast} onClose={() => setToast('')} />}

        <Modal open={reviewModal} title={`Review AI Recommendation: ${selectedStudent?.full_name}`} onClose={() => setReviewModal(false)}>
          <div className="modal-form">
            <div className="review-callout">
              <strong>{selectedStudent?.target_role}</strong>
              <span>Target Role · {selectedStudent?.career_match || 92}% career match</span>
            </div>
            <label>Decision
              <select value={decision} onChange={(e) => setDecision(e.target.value)}>
                <option value="Approved">Approved</option>
                <option value="Modified">Modified</option>
                <option value="Needs evidence">Needs evidence</option>
                <option value="Rejected">Rejected</option>
              </select>
            </label>
            <label>Mentor Feedback & Guidance
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Provide rationale and guidance for the student..." rows={4} />
            </label>
            <button className="primary-btn full" onClick={handleReviewSave}>Save Mentor Review</button>
          </div>
        </Modal>
      </div>
    </Guard>
  )
}

export function MentorCertificates() {
  const [data, setData] = useState<any>(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const load = () => {
    setError('')
    backend.mentorOverview().then(setData).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  if (error) return <ErrorCard message={error} onRetry={load} />
  if (!data) return <LoadingCard />

  return (
    <Guard roles={['mentor', 'admin']}>
      <div className="page-stack">
        <SectionHeader
          eyebrow="GUIDANCE TOOLS · CERTIFICATES"
          title="Certificate Guidance"
          subtitle="Recommend industry certifications aligned to student skill gaps and career trajectories."
          action={<Badge tone="cyan">AI Recommended</Badge>}
        />
        <div className="mentor-student-grid full-grid">
          {data.students.map((s: any) => (
            <div className="card" key={s.id}>
              <div className="card-head">
                <div className="student-cell"><div className="avatar small">{initials(s.full_name)}</div><div><strong>{s.full_name}</strong><span style={{ fontSize: 11, color: '#718099' }}>{s.target_role}</span></div></div>
                <Badge tone="violet">{s.career_match || 92}% match</Badge>
              </div>
              <div style={{ marginTop: 12 }}>
                <div className="recommendation-row">
                  <div className="recommendation-icon"><Icon name="award" /></div>
                  <div style={{ flex: 1 }}>
                    <strong>AWS Certified Solutions Architect</strong>
                    <p>Closes target role cloud infrastructure gap.</p>
                    <small>Amazon Web Services · 4–6 weeks</small>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button className="ghost-btn" style={{ fontSize: 11, height: 26, padding: '0 8px' }} onClick={() => setToast(`Approved AWS certificate for ${s.full_name}`)}><Icon name="check" size={11} /> Approve</button>
                      <button className="ghost-btn" style={{ fontSize: 11, height: 26, padding: '0 8px' }} onClick={() => setToast(`Recommended alternative cert for ${s.full_name}`)}>Suggest Alternative</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {toast && <Toast message={toast} onClose={() => setToast('')} />}
      </div>
    </Guard>
  )
}

export function MentorProjects() {
  const [data, setData] = useState<any>(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const load = () => {
    setError('')
    backend.mentorOverview().then(setData).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  if (error) return <ErrorCard message={error} onRetry={load} />
  if (!data) return <LoadingCard />

  return (
    <Guard roles={['mentor', 'admin']}>
      <div className="page-stack">
        <SectionHeader
          eyebrow="GUIDANCE TOOLS · PROJECTS"
          title="Project Assignments & Lab"
          subtitle="Assign portfolio projects that provide verified evidence for student skill gaps."
          action={<Badge tone="violet">Evidence Based</Badge>}
        />
        <div className="mentor-student-grid full-grid">
          {data.students.map((s: any) => (
            <div className="card" key={s.id}>
              <div className="card-head">
                <div className="student-cell"><div className="avatar small">{initials(s.full_name)}</div><div><strong>{s.full_name}</strong><span style={{ fontSize: 11, color: '#718099' }}>{s.target_role}</span></div></div>
                <Badge tone="cyan">Readiness {Math.round(s.readiness_score)}%</Badge>
              </div>
              <div style={{ marginTop: 12 }}>
                <div className="recommendation-row">
                  <div className="recommendation-icon cyan"><Icon name="folder" /></div>
                  <div style={{ flex: 1 }}>
                    <strong>Visual Defect Detector</strong>
                    <p>Demonstrates deep learning and deployment in one portfolio artifact.</p>
                    <small>4–5 weeks · +15% ML profile</small>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button className="ghost-btn" style={{ fontSize: 11, height: 26, padding: '0 8px' }} onClick={() => setToast(`Recommended project to ${s.full_name}`)}><Icon name="check" size={11} /> Recommend</button>
                      <button className="ghost-btn" style={{ fontSize: 11, height: 26, padding: '0 8px' }} onClick={() => setToast(`Added to ${s.full_name}'s roadmap`)}>Add to Roadmap</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {toast && <Toast message={toast} onClose={() => setToast('')} />}
      </div>
    </Guard>
  )
}

export function MentorGoals() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [studentId, setStudentId] = useState(1)
  const [goalTitle, setGoalTitle] = useState('')
  const [toast, setToast] = useState('')

  const load = () => {
    setError('')
    backend.mentorOverview().then(setData).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  const createGoal = async () => {
    if (!goalTitle.trim()) return
    try {
      await backend.addMentorGoal({ student_id: studentId, title: goalTitle.trim(), progress: 0 })
      setOpenModal(false)
      setGoalTitle('')
      setToast('Goal created successfully')
      load()
    } catch (e: any) {
      setToast(e.message || 'Failed to create goal')
    }
  }

  if (error) return <ErrorCard message={error} onRetry={load} />
  if (!data) return <LoadingCard />

  return (
    <Guard roles={['mentor', 'admin']}>
      <div className="page-stack">
        <SectionHeader
          eyebrow="GUIDANCE TOOLS · GOALS"
          title="Mentor Goals"
          subtitle="Establish measurable milestones and track completion across your student cohort."
          action={<button className="primary-btn" onClick={() => setOpenModal(true)}><Icon name="plus" size={14} /> Set Goal</button>}
        />
        <div className="card">
          <div className="card-head">
            <div><span className="eyebrow">ACTIVE STUDENT GOALS</span><h3>Cohort Milestone Tracker</h3></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Goal Title</th><th>Status</th><th>Progress</th><th>Action</th></tr></thead>
              <tbody>
                {data.students.map((s: any) => (
                  <tr key={s.id}>
                    <td><div className="student-cell"><div className="avatar small">{initials(s.full_name)}</div><strong>{s.full_name}</strong></div></td>
                    <td>Complete Docker deployment & API containerization</td>
                    <td><Badge tone="violet">In Progress</Badge></td>
                    <td><ProgressBar value={50} showValue={false} /></td>
                    <td><Link to={`/mentor/students/${s.id}`} className="secondary-btn" style={{ fontSize: 11, padding: '4px 8px' }}>Manage</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {toast && <Toast message={toast} onClose={() => setToast('')} />}

        <Modal open={openModal} title="Set a Student Goal" onClose={() => setOpenModal(false)}>
          <div className="modal-form">
            <label>Select Student
              <select value={studentId} onChange={(e) => setStudentId(Number(e.target.value))}>
                {data.students.map((s: any) => (
                  <option value={s.id} key={s.id}>{s.full_name} ({s.target_role})</option>
                ))}
              </select>
            </label>
            <label>Goal Title
              <input value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder="e.g. Prepare portfolio demo for ML deployment" />
            </label>
            <button className="primary-btn full" onClick={createGoal}>Create Goal</button>
          </div>
        </Modal>
      </div>
    </Guard>
  )
}

export function MentorNotes() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [studentId, setStudentId] = useState(1)
  const [note, setNote] = useState('')
  const [toast, setToast] = useState('')

  const load = () => {
    setError('')
    backend.mentorOverview().then(setData).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  const saveNote = async () => {
    if (!note.trim()) return
    try {
      await backend.addMentorNote({ student_id: studentId, note: note.trim() })
      setOpenModal(false)
      setNote('')
      setToast('Private mentor note saved')
      load()
    } catch (e: any) {
      setToast(e.message || 'Failed to save note')
    }
  }

  if (error) return <ErrorCard message={error} onRetry={load} />
  if (!data) return <LoadingCard />

  return (
    <Guard roles={['mentor', 'admin']}>
      <div className="page-stack">
        <SectionHeader
          eyebrow="GUIDANCE TOOLS · NOTES"
          title="Private Mentor Notes"
          subtitle="Keep confidential records of 1-on-1 guidance, observations, and student action items."
          action={<button className="primary-btn" onClick={() => setOpenModal(true)}><Icon name="plus" size={14} /> Add Note</button>}
        />
        <div className="card">
          <div className="card-head">
            <div><span className="eyebrow">NOTES ARCHIVE</span><h3>Recent Student Observations</h3></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Note</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {data.students.map((s: any) => (
                  <tr key={s.id}>
                    <td><div className="student-cell"><div className="avatar small">{initials(s.full_name)}</div><strong>{s.full_name}</strong></div></td>
                    <td>Discussed portfolio deployment strategy and cloud infrastructure priorities.</td>
                    <td>Today</td>
                    <td><Link to={`/mentor/students/${s.id}`} className="secondary-btn" style={{ fontSize: 11, padding: '4px 8px' }}>Open Student</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {toast && <Toast message={toast} onClose={() => setToast('')} />}

        <Modal open={openModal} title="Add Private Note" onClose={() => setOpenModal(false)}>
          <div className="modal-form">
            <label>Select Student
              <select value={studentId} onChange={(e) => setStudentId(Number(e.target.value))}>
                {data.students.map((s: any) => (
                  <option value={s.id} key={s.id}>{s.full_name} ({s.target_role})</option>
                ))}
              </select>
            </label>
            <label>Private Note
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Enter your private observation..." rows={4} />
            </label>
            <button className="primary-btn full" onClick={saveNote}>Save Note</button>
          </div>
        </Modal>
      </div>
    </Guard>
  )
}

export function MentorAlerts() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const load = () => {
    setError('')
    backend.mentorOverview().then(setData).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  const resolveAlert = async (id: number) => {
    try {
      await backend.resolveAlert(id)
      setToast('Alert resolved successfully')
      load()
    } catch (e: any) {
      setToast(e.message || 'Failed to resolve alert')
    }
  }

  if (error) return <ErrorCard message={error} onRetry={load} />
  if (!data) return <LoadingCard />

  return (
    <Guard roles={['mentor', 'admin']}>
      <div className="page-stack">
        <SectionHeader
          eyebrow="GUIDANCE TOOLS · ALERTS"
          title="Active Mentor Alerts"
          subtitle="Resolve student evidence gaps, inactive roadmaps, and review requests."
          action={<Badge tone="amber">{data.alerts.length} unresolved</Badge>}
        />
        <div className="card">
          <div className="card-head">
            <div><span className="eyebrow">ALERT QUEUE</span><h3>System & Student Notifications</h3></div>
          </div>
          {data.alerts.length ? (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Severity</th><th>Student ID</th><th>Alert Title</th><th>Description</th><th>Action</th></tr></thead>
                <tbody>
                  {data.alerts.map((a: any) => (
                    <tr key={a.id}>
                      <td><Badge tone={a.severity === 'high' ? 'rose' : 'amber'}>{a.severity}</Badge></td>
                      <td><strong>#{a.student_id}</strong></td>
                      <td><strong>{a.title}</strong></td>
                      <td>{a.message}</td>
                      <td>
                        <button className="secondary-btn" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => resolveAlert(a.id)}>
                          <Icon name="check" size={12} /> Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>All mentor alerts are resolved</h3>
              <p>No open student alerts require your attention right now.</p>
            </div>
          )}
        </div>
        {toast && <Toast message={toast} onClose={() => setToast('')} />}
      </div>
    </Guard>
  )
}

// ==========================================
// 2. ADMIN WORKSPACE PAGES
// ==========================================

export function AdminHub() {
  const [data, setData] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [error, setError] = useState('')
  const [assignOpen, setAssignOpen] = useState(false)
  const [createMentorOpen, setCreateMentorOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [mentorId, setMentorId] = useState(0)
  const [studentId, setStudentId] = useState(0)
  const [mentorName, setMentorName] = useState('')
  const [mentorEmail, setMentorEmail] = useState('')
  const [mentorSpec, setMentorSpec] = useState('AI / Machine Learning')

  const load = () => {
    setError('')
    Promise.all([backend.adminOverview(), backend.adminUsers()])
      .then(([a, u]) => {
        setData(a)
        setUsers(u)
        setMentorId((v) => v || u.find((x: any) => x.role === 'mentor')?.id || 0)
        setStudentId((v) => v || u.find((x: any) => x.role === 'student')?.id || 0)
      })
      .catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  if (error) return <ErrorCard message={error} onRetry={load} />
  if (!data) return <LoadingCard />

  const students = users.filter((u) => u.role === 'student')
  const mentors = users.filter((u) => u.role === 'mentor')

  return (
    <Guard roles={['admin']}>
      <div className="page-stack">
        <SectionHeader
          eyebrow="ADMIN COMMAND CENTER"
          title="CareerX institution overview"
          subtitle="Assign mentors, monitor capacity, inspect platform activity and keep the career development loop healthy."
          action={<Badge tone="violet">Administrator</Badge>}
        />
        <div className="stats-grid four">
          <StatCard label="Students" value={String(data.students)} icon="users" tone="violet" />
          <StatCard label="Mentors" value={String(data.mentors)} icon="hardhat" tone="cyan" />
          <StatCard label="Active assignments" value={String(data.active_assignments)} icon="target" tone="green" />
          <StatCard label="Open mentor alerts" value={String(data.open_alerts)} icon="alert" tone="amber" />
        </div>
        <div className="admin-live-grid">
          <div className="card">
            <div className="card-head">
              <div><span className="eyebrow">MENTOR CAPACITY</span><h3>Students per mentor</h3></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="secondary-btn" onClick={() => setCreateMentorOpen(true)}><Icon name="plus" size={14} /> Create Mentor</button>
                <button className="primary-btn" onClick={() => setAssignOpen(true)}><Icon name="plus" size={14} /> Assign student</button>
              </div>
            </div>
            {data.mentors_overview.map((m: any) => (
              <div className="mentor-capacity" key={m.id}>
                <div className="mentor-cap-avatar">{initials(m.name)}</div>
                <div className="mentor-cap-main">
                  <div><strong>{m.name}</strong><span>{m.email}</span></div>
                  <div className="mentor-cap-bar"><i style={{ width: `${Math.min(100, (m.students / 10) * 100)}%` }} /></div>
                </div>
                <strong>{m.students}/10</strong>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-head">
              <div><span className="eyebrow">SYSTEM SIGNALS</span><h3>Current platform health</h3></div>
            </div>
            {[
              ['Recommendation generation', `${data.recommendations} stored`, 'green'],
              ['Mentor coverage', `${data.active_assignments}/${data.students} assigned`, 'cyan'],
              ['Open evidence alerts', String(data.open_alerts), 'amber'],
              ['User accounts', String(data.users), 'violet'],
            ].map(([a, b, c]) => (
              <div className="system-signal" key={a as string}>
                <span><i className={`signal-dot ${c}`} />{a}</span>
                <strong>{b}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <div><span className="eyebrow">USER MANAGEMENT</span><h3>Students and mentors</h3></div>
            <Link to="/admin/users" className="secondary-btn">Open users <Icon name="arrow" size={13} /></Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
              <tbody>
                {users.slice(0, 12).map((u) => (
                  <tr key={u.id}>
                    <td><div className="student-cell"><div className="avatar small">{initials(u.full_name)}</div><strong>{u.full_name}</strong></div></td>
                    <td>{u.email}</td>
                    <td><Badge tone={u.role === 'admin' ? 'violet' : u.role === 'mentor' ? 'cyan' : 'neutral'}>{u.role}</Badge></td>
                    <td><Badge tone={u.active ? 'green' : 'rose'}>{u.active ? 'Active' : 'Disabled'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Modal open={assignOpen} title="Assign student to mentor" onClose={() => setAssignOpen(false)}>
          <div className="modal-form">
            <label>Mentor
              <select value={mentorId} onChange={(e) => setMentorId(Number(e.target.value))}>
                {mentors.map((m) => <option value={m.id} key={m.id}>{m.full_name}</option>)}
              </select>
            </label>
            <label>Student
              <select value={studentId} onChange={(e) => setStudentId(Number(e.target.value))}>
                {students.map((s) => <option value={s.id} key={s.id}>{s.full_name}</option>)}
              </select>
            </label>
            <button
              className="primary-btn full"
              onClick={async () => {
                try {
                  await backend.adminAssign({ mentor_id: mentorId, student_id: studentId })
                  setAssignOpen(false)
                  setToast('Student assigned successfully')
                  load()
                } catch (e: any) {
                  setToast(e.message || 'Failed to assign student')
                }
              }}
            >
              Assign student
            </button>
          </div>
        </Modal>

        <Modal open={createMentorOpen} title="Create Mentor Account" onClose={() => setCreateMentorOpen(false)}>
          <div className="modal-form">
            <label>Full Name
              <input value={mentorName} onChange={(e) => setMentorName(e.target.value)} placeholder="e.g. Dr. Kavitha Ramesh" />
            </label>
            <label>Institutional Email
              <input type="email" value={mentorEmail} onChange={(e) => setMentorEmail(e.target.value)} placeholder="mentor@careerx.ai" />
            </label>
            <label>Specialization
              <input value={mentorSpec} onChange={(e) => setMentorSpec(e.target.value)} placeholder="e.g. AI / Machine Learning" />
            </label>
            <button
              className="primary-btn full"
              onClick={async () => {
                if (!mentorName || !mentorEmail) {
                  setToast('Please enter name and email')
                  return
                }
                try {
                  await backend.adminCreateMentor({ full_name: mentorName, email: mentorEmail, specialization: mentorSpec })
                  setCreateMentorOpen(false)
                  setToast('Mentor account created successfully')
                  setMentorName('')
                  setMentorEmail('')
                  load()
                } catch (e: any) {
                  setToast(e.message || 'Failed to create mentor')
                }
              }}
            >
              Create Mentor
            </button>
          </div>
        </Modal>

        {toast && <Toast message={toast} onClose={() => setToast('')} />}
      </div>
    </Guard>
  )
}

export function AdminUsersLive() {
  const [users, setUsers] = useState<any[]>([])
  const [error, setError] = useState('')
  const load = () => {
    setError('')
    backend.adminUsers().then(setUsers).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  if (error) return <ErrorCard message={error} onRetry={load} />
  if (!users.length) return <LoadingCard />

  return (
    <Guard roles={['admin']}>
      <div className="page-stack">
        <SectionHeader eyebrow="ADMIN · USER MANAGEMENT" title="Users & Roles" subtitle="Live student, mentor, and administrator accounts." />
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Active</th><th>Created</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><div className="student-cell"><div className="avatar small">{initials(u.full_name)}</div><strong>{u.full_name}</strong></div></td>
                    <td>{u.email}</td>
                    <td><Badge tone={u.role === 'admin' ? 'violet' : u.role === 'mentor' ? 'cyan' : 'neutral'}>{u.role}</Badge></td>
                    <td><Badge tone={u.active ? 'green' : 'rose'}>{u.active ? 'Active' : 'Disabled'}</Badge></td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Guard>
  )
}

export function AdminMentorsLive() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [specialization, setSpecialization] = useState('AI / Machine Learning')
  const [toast, setToast] = useState('')

  const load = () => {
    setError('')
    backend.adminOverview().then(setData).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!name || !email) {
      setToast('Please provide full name and email')
      return
    }
    try {
      await backend.adminCreateMentor({ full_name: name, email, specialization })
      setCreateOpen(false)
      setName('')
      setEmail('')
      setToast('Mentor account provisioned successfully')
      load()
    } catch (e: any) {
      setToast(e.message || 'Failed to create mentor')
    }
  }

  if (error) return <ErrorCard message={error} onRetry={load} />
  if (!data) return <LoadingCard />

  return (
    <Guard roles={['admin']}>
      <div className="page-stack">
        <SectionHeader
          eyebrow="ADMIN · MENTORS"
          title="Mentor Provisioning & Workload"
          subtitle="Manage faculty mentor accounts and monitor 10-student capacity allocations."
          action={<button className="primary-btn" onClick={() => setCreateOpen(true)}><Icon name="plus" size={14} /> Create Mentor</button>}
        />
        <div className="card">
          <div className="card-head">
            <div><span className="eyebrow">FACULTY MENTORS</span><h3>Workload & Assignment Status</h3></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Mentor</th><th>Email</th><th>Assigned</th><th>Capacity</th><th>Available Slots</th><th>Workload</th></tr></thead>
              <tbody>
                {data.mentors_overview.map((m: any) => {
                  const capacity = 10
                  const assigned = m.students
                  const available = Math.max(0, capacity - assigned)
                  return (
                    <tr key={m.id}>
                      <td><div className="student-cell"><div className="avatar small">{initials(m.name)}</div><strong>{m.name}</strong></div></td>
                      <td>{m.email}</td>
                      <td><strong>{assigned}</strong></td>
                      <td>{capacity}</td>
                      <td><Badge tone={available > 0 ? 'green' : 'amber'}>{available} slots</Badge></td>
                      <td><ProgressBar value={(assigned / capacity) * 100} showValue={false} tone={assigned >= 10 ? 'amber' : 'cyan'} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {toast && <Toast message={toast} onClose={() => setToast('')} />}

        <Modal open={createOpen} title="Provision New Mentor Account" onClose={() => setCreateOpen(false)}>
          <div className="modal-form">
            <label>Full Name
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dr. Kavitha Ramesh" />
            </label>
            <label>Institutional Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mentor@careerx.ai" />
            </label>
            <label>Specialization
              <input value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g. AI / Machine Learning" />
            </label>
            <button className="primary-btn full" onClick={handleCreate}>Create Mentor Account</button>
          </div>
        </Modal>
      </div>
    </Guard>
  )
}

export function AdminAssignmentsLive() {
  const [users, setUsers] = useState<any[]>([])
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const [assignOpen, setAssignOpen] = useState(false)
  const [mentorId, setMentorId] = useState(0)
  const [studentId, setStudentId] = useState(0)
  const [toast, setToast] = useState('')

  const load = () => {
    setError('')
    Promise.all([backend.adminOverview(), backend.adminUsers()])
      .then(([a, u]) => {
        setData(a)
        setUsers(u)
        setMentorId((v) => v || u.find((x: any) => x.role === 'mentor')?.id || 0)
        setStudentId((v) => v || u.find((x: any) => x.role === 'student')?.id || 0)
      })
      .catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  if (error) return <ErrorCard message={error} onRetry={load} />
  if (!data) return <LoadingCard />

  const students = users.filter((u) => u.role === 'student')
  const mentors = users.filter((u) => u.role === 'mentor')

  const handleAssign = async () => {
    try {
      await backend.adminAssign({ mentor_id: mentorId, student_id: studentId })
      setAssignOpen(false)
      setToast('Student assignment updated successfully')
      load()
    } catch (e: any) {
      setToast(e.message || 'Failed to assign student')
    }
  }

  return (
    <Guard roles={['admin']}>
      <div className="page-stack">
        <SectionHeader
          eyebrow="ADMIN · ASSIGNMENTS"
          title="Student-Mentor Assignment Matrix"
          subtitle="Pair students with mentors according to faculty specialization and 10-student capacity."
          action={<button className="primary-btn" onClick={() => setAssignOpen(true)}><Icon name="plus" size={14} /> Assign Student</button>}
        />
        <div className="card">
          <div className="card-head">
            <div><span className="eyebrow">ASSIGNMENT ROSTER</span><h3>Current Student Pairs</h3></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Email</th><th>Assigned Mentor</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td><div className="student-cell"><div className="avatar small">{initials(s.full_name)}</div><strong>{s.full_name}</strong></div></td>
                    <td>{s.email}</td>
                    <td><Badge tone="cyan">Dr. Arun Mentor</Badge></td>
                    <td><Badge tone="green">Active</Badge></td>
                    <td>
                      <button className="secondary-btn" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => { setStudentId(s.id); setAssignOpen(true) }}>
                        Reassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {toast && <Toast message={toast} onClose={() => setToast('')} />}

        <Modal open={assignOpen} title="Assign Student to Faculty Mentor" onClose={() => setAssignOpen(false)}>
          <div className="modal-form">
            <label>Faculty Mentor
              <select value={mentorId} onChange={(e) => setMentorId(Number(e.target.value))}>
                {mentors.map((m) => <option value={m.id} key={m.id}>{m.full_name}</option>)}
              </select>
            </label>
            <label>Student
              <select value={studentId} onChange={(e) => setStudentId(Number(e.target.value))}>
                {students.map((s) => <option value={s.id} key={s.id}>{s.full_name}</option>)}
              </select>
            </label>
            <button className="primary-btn full" onClick={handleAssign}>Assign Student</button>
          </div>
        </Modal>
      </div>
    </Guard>
  )
}

export function AdminAuditLive() {
  const [logs, setLogs] = useState<any[]>([])
  const [error, setError] = useState('')
  const load = () => {
    setError('')
    backend.adminAudit().then(setLogs).catch((e) => setError(e.message))
  }
  useEffect(() => { load() }, [])

  if (error) return <ErrorCard message={error} onRetry={load} />

  return (
    <Guard roles={['admin']}>
      <div className="page-stack">
        <SectionHeader
          eyebrow="ADMIN · AUDIT LOGS"
          title="System Audit & Governance"
          subtitle="A factual, immutable record of administrative assignments, mentor decisions, and security events."
        />
        <div className="card">
          <div className="card-head">
            <div><span className="eyebrow">AUDIT STREAM</span><h3>Administrative Actions Logged</h3></div>
            <Badge tone="green">{logs.length} events</Badge>
          </div>
          {logs.length ? (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Time</th><th>Actor Role</th><th>Action</th><th>Module</th><th>Status</th></tr></thead>
                <tbody>
                  {logs.map((l, i) => (
                    <tr key={l.id || i}>
                      <td>{new Date(l.created_at).toLocaleString()}</td>
                      <td><Badge tone={l.actor_role === 'admin' ? 'violet' : 'cyan'}>{l.actor_role}</Badge></td>
                      <td><strong>{l.action}</strong></td>
                      <td>{l.module}</td>
                      <td><Badge tone={l.status === 'Success' ? 'green' : 'amber'}>{l.status || 'Success'}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No audit activity yet</h3>
              <p>System actions and mentor guidance will be recorded here.</p>
            </div>
          )}
        </div>
      </div>
    </Guard>
  )
}

// ==========================================
// 3. ROLE-AWARE SETTINGS PAGES
// ==========================================

export function StudentSettings({ user }: { user: any }) {
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState(user?.full_name || 'Jayaseelan G')
  const [role, setRole] = useState('AI / ML Engineer')
  const [dept, setDept] = useState('Artificial Intelligence and Data Science')
  const [gradYear, setGradYear] = useState('2027')

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="STUDENT SETTINGS" title="CareerX Profile & Preferences" subtitle="Manage your student account, career targets, notifications and security." />
      <div className="settings-layout">
        <div className="settings-nav">
          <button className="active">Profile settings <Icon name="arrow" size={14} /></button>
          <button>Notifications <Icon name="arrow" size={14} /></button>
          <button>Privacy & consent <Icon name="arrow" size={14} /></button>
          <button>Security <Icon name="arrow" size={14} /></button>
        </div>
        <div className="card settings-panel">
          <div className="settings-section">
            <div><span className="eyebrow">PROFILE SETTINGS</span><h3>Student Identity</h3></div>
            <div className="form-grid">
              <label>Display name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
              <label>Target career role<input value={role} onChange={(e) => setRole(e.target.value)} /></label>
              <label>Department<input value={dept} onChange={(e) => setDept(e.target.value)} /></label>
              <label>Graduation year
                <select value={gradYear} onChange={(e) => setGradYear(e.target.value)}>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </label>
            </div>
          </div>
          <div className="settings-section">
            <div><span className="eyebrow">PREFERENCES</span><h3>Experience & Guidance</h3></div>
            <div className="toggle-row"><div><strong>Career insight emails</strong><span>Receive updates on roadmap progress.</span></div><button className="toggle on"><i /></button></div>
            <div className="toggle-row"><div><strong>AI Coach proactive prompts</strong><span>Allow personalized dashboard advice.</span></div><button className="toggle on"><i /></button></div>
          </div>
          <div className="settings-footer">
            <button className="secondary-btn">Cancel</button>
            <button className="primary-btn" onClick={() => setSaved(true)}>Save changes <Icon name="check" size={15} /></button>
          </div>
        </div>
      </div>
      {saved && <Toast message="Student settings saved successfully." onClose={() => setSaved(false)} />}
    </div>
  )
}

export function MentorSettings({ user }: { user: any }) {
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState(user?.full_name || 'Dr. Arun Mentor')
  const [dept, setDept] = useState('Artificial Intelligence and Data Science')
  const [spec, setSpec] = useState('AI / Machine Learning')

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="MENTOR SETTINGS" title="Faculty Mentor Profile" subtitle="Manage your mentor profile, department affiliation, capacity and notification preferences." />
      <div className="settings-layout">
        <div className="settings-nav">
          <button className="active">Mentor Profile <Icon name="arrow" size={14} /></button>
          <button>Guidance Preferences <Icon name="arrow" size={14} /></button>
          <button>Alert Notifications <Icon name="arrow" size={14} /></button>
          <button>Security & Access <Icon name="arrow" size={14} /></button>
        </div>
        <div className="card settings-panel">
          <div className="settings-section">
            <div><span className="eyebrow">MENTOR IDENTITY</span><h3>Faculty Profile</h3></div>
            <div className="form-grid">
              <label>Display name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
              <label>Mentor ID<input value="MTR-8492" disabled /></label>
              <label>Department<input value={dept} onChange={(e) => setDept(e.target.value)} /></label>
              <label>Specialization<input value={spec} onChange={(e) => setSpec(e.target.value)} /></label>
              <label>Student Capacity<input value="10" disabled /></label>
              <label>Assigned Students<input value="10" disabled /></label>
            </div>
          </div>
          <div className="settings-section">
            <div><span className="eyebrow">MENTOR PREFERENCES</span><h3>Guidance Workflow</h3></div>
            <div className="toggle-row"><div><strong>High-severity alert alerts</strong><span>Immediate notification when a student roadmap stalls.</span></div><button className="toggle on"><i /></button></div>
            <div className="toggle-row"><div><strong>AI recommendation digest</strong><span>Weekly digest of new student career recommendations.</span></div><button className="toggle on"><i /></button></div>
          </div>
          <div className="settings-footer">
            <button className="secondary-btn">Cancel</button>
            <button className="primary-btn" onClick={() => setSaved(true)}>Save Mentor Settings <Icon name="check" size={15} /></button>
          </div>
        </div>
      </div>
      {saved && <Toast message="Mentor profile saved successfully." onClose={() => setSaved(false)} />}
    </div>
  )
}

export function AdminSettings({ user }: { user: any }) {
  const [saved, setSaved] = useState(false)
  const [name, setName] = useState(user?.full_name || 'CareerX Admin')
  const [org, setOrg] = useState('CareerX Institution')

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="ADMIN SETTINGS" title="Institution Platform Configuration" subtitle="Manage institution settings, role permissions, audit policies and governance rules." />
      <div className="settings-layout">
        <div className="settings-nav">
          <button className="active">Administrator Profile <Icon name="arrow" size={14} /></button>
          <button>Platform Governance <Icon name="arrow" size={14} /></button>
          <button>Audit & Compliance <Icon name="arrow" size={14} /></button>
          <button>Security Controls <Icon name="arrow" size={14} /></button>
        </div>
        <div className="card settings-panel">
          <div className="settings-section">
            <div><span className="eyebrow">ADMINISTRATOR IDENTITY</span><h3>System Administrator</h3></div>
            <div className="form-grid">
              <label>Display name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
              <label>Administrator ID<input value="ADM-001" disabled /></label>
              <label>Organization<input value={org} onChange={(e) => setOrg(e.target.value)} /></label>
              <label>Assigned Role<input value="System Administrator" disabled /></label>
            </div>
          </div>
          <div className="settings-section">
            <div><span className="eyebrow">GOVERNANCE & AUDIT</span><h3>Administrative Policies</h3></div>
            <div className="toggle-row"><div><strong>Audit Logging Enabled</strong><span>Log all mentor recommendations, student assignments and security events.</span></div><button className="toggle on"><i /></button></div>
            <div className="toggle-row"><div><strong>Role-Based Access Enforcement</strong><span>Strictly isolate Student, Mentor, and Administrator scopes.</span></div><button className="toggle on"><i /></button></div>
          </div>
          <div className="settings-footer">
            <button className="secondary-btn">Cancel</button>
            <button className="primary-btn" onClick={() => setSaved(true)}>Save Platform Settings <Icon name="check" size={15} /></button>
          </div>
        </div>
      </div>
      {saved && <Toast message="Admin platform settings updated successfully." onClose={() => setSaved(false)} />}
    </div>
  )
}

export function SettingsDispatcher() {
  const user = getUser()
  if (user?.role === 'mentor') return <MentorSettings user={user} />
  if (user?.role === 'admin') return <AdminSettings user={user} />
  return <StudentSettings user={user} />
}
