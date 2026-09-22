import { ReactNode, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import Icon from '../components/Icon'
import { notifications } from '../data/mockData'
import { getUser, logout } from '../services/backend'

const studentNav = [
  {
    section: 'Workspace',
    items: [
      ['Overview', '/app', 'dashboard'],
      ['My Profile', '/app/profile', 'user'],
      ['Skills & Interests', '/app/skills', 'sparkles'],
      ['Resume & Evidence', '/app/evidence', 'filecheck'],
      ['Trust Center', '/app/trust', 'shield'],
    ],
  },
  {
    section: 'Career Intelligence',
    items: [
      ['Career Matches', '/app/careers', 'target'],
      ['Skill Gaps', '/app/skill-gaps', 'bar'],
      ['Job Readiness', '/app/readiness', 'gauge'],
      ['Career Roadmap', '/app/roadmap', 'route'],
      ['Project Lab', '/app/projects', 'folder'],
      ['What-If Simulator', '/app/simulator', 'wand'],
      ['AI Career Coach', '/app/coach', 'brain'],
    ],
  },
  {
    section: 'Guidance',
    items: [
      ['Market Insights', '/app/market', 'trend'],
      ['Progress', '/app/progress', 'activity'],
      ['Mentor Review', '/app/mentor', 'users'],
      ['Feedback', '/app/feedback', 'message'],
      ['Responsible AI', '/app/responsible-ai', 'shield'],
    ],
  },
  { section: 'System', items: [['Settings', '/app/settings', 'settings']] },
]

const mentorNav = [
  {
    section: 'MENTOR WORKSPACE',
    items: [
      ['Mentor Hub', '/mentor', 'hardhat'],
      ['My 10 Students', '/mentor/students', 'users'],
      ['Cohort Progress', '/mentor/progress', 'activity'],
      ['Review AI Recommendations', '/mentor/recommendations', 'sparkles'],
    ],
  },
  {
    section: 'GUIDANCE TOOLS',
    items: [
      ['Certificate Guidance', '/mentor/certificates', 'award'],
      ['Project Assignments', '/mentor/projects', 'folder'],
      ['Mentor Goals', '/mentor/goals', 'target'],
      ['Private Notes', '/mentor/notes', 'message'],
      ['Active Alerts', '/mentor/alerts', 'alert'],
    ],
  },
  {
    section: 'ACCOUNT',
    items: [
      ['Mentor Settings', '/mentor/settings', 'settings'],
    ],
  },
]

const adminNav = [
  {
    section: 'ADMIN WORKSPACE',
    items: [
      ['Admin Console', '/admin', 'grid'],
      ['User Management', '/admin/users', 'users'],
      ['Mentor Provisioning', '/admin/mentors', 'hardhat'],
      ['Student Assignments', '/admin/assignments', 'target'],
      ['System Analytics', '/admin/analytics', 'bar'],
      ['Audit Logs', '/admin/audit', 'filecheck'],
    ],
  },
  {
    section: 'ACCOUNT & PORTALS',
    items: [
      ['Admin Settings', '/admin/settings', 'settings'],
      ['Mentor View', '/mentor', 'hardhat'],
      ['Student View', '/app', 'user'],
    ],
  },
]

function Brand() {
  return (
    <Link to="/" className="brand">
      <div className="brand-mark">
        <Icon name="sparkles" size={18} />
      </div>
      <div>
        <strong>CareerX</strong>
        <span>AI</span>
      </div>
    </Link>
  )
}

const initials = (name?: string) =>
  (name || 'User')
    .split(/\s+/)
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export default function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = getUser()

  const currentNav =
    user?.role === 'mentor'
      ? mentorNav
      : user?.role === 'admin'
      ? adminNav
      : studentNav

  const handleLogout = () => {
    const role = user?.role || 'student'
    logout()
    if (role === 'mentor') navigate('/login/mentor')
    else if (role === 'admin') navigate('/login/admin')
    else navigate('/login/student')
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/mentor') return 'Mentor Hub'
    if (path === '/mentor/students') return 'My 10 Students'
    if (path.startsWith('/mentor/students/')) return 'Student Progress'
    if (path === '/mentor/progress') return 'Cohort Progress'
    if (path === '/mentor/recommendations') return 'Review AI Recommendations'
    if (path === '/mentor/certificates') return 'Certificate Guidance'
    if (path === '/mentor/projects') return 'Project Assignments'
    if (path === '/mentor/goals') return 'Mentor Goals'
    if (path === '/mentor/notes') return 'Private Notes'
    if (path === '/mentor/alerts') return 'Active Alerts'
    if (path === '/mentor/settings') return 'Mentor Settings'

    if (path === '/admin') return 'Admin Console'
    if (path === '/admin/users') return 'User Management'
    if (path === '/admin/mentors') return 'Mentor Provisioning'
    if (path === '/admin/assignments') return 'Student Assignments'
    if (path === '/admin/analytics') return 'System Analytics'
    if (path === '/admin/audit' || path === '/admin/audit-logs') return 'Audit Logs'
    if (path === '/admin/settings') return 'Admin Settings'

    const segment = path.split('/')[2] || 'dashboard'
    return titleFor(segment)
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-top">
          <Brand />
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            <Icon name={collapsed ? 'openleft' : 'closeleft'} size={17} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {currentNav.map((group) => (
            <div className="nav-group" key={group.section}>
              <div className="nav-section">{group.section}</div>
              {group.items.map(([label, path, icon]) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/mentor' || path === '/admin' || path === '/app'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon name={icon === 'route' ? 'arrow' : icon} />
                  <span>{label}</span>
                  {label === 'Career Matches' && <em>5</em>}
                  {label === 'Active Alerts' && <em style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}>3</em>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="mini-profile">
            <div className="avatar">{initials(user?.full_name)}</div>
            <div className="mini-profile-copy">
              <strong>{user?.full_name || 'Jayaseelan G'}</strong>
              <span style={{ textTransform: 'capitalize' }}>
                {user?.role === 'mentor'
                  ? 'Faculty Mentor'
                  : user?.role === 'admin'
                  ? 'Administrator'
                  : 'Student'}
              </span>
            </div>
            <button
              className="icon-btn"
              title="Sign out"
              onClick={handleLogout}
              style={{ color: '#fb7185' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="top-left">
            <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}>
              <Icon name="menu" />
            </button>
            <div className="crumb">
              Workspace <span>/</span> <strong>{getPageTitle()}</strong>
            </div>
          </div>
          <div className="top-actions">
            <div className="top-search">
              <Icon name="search" size={16} />
              <input placeholder="Search careers, skills, projects..." />
              <span>⌘ K</span>
            </div>
            <button
              className="icon-btn notification-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Icon name="bell" />
              <i />
            </button>
            <div className="top-avatar">{initials(user?.full_name)}</div>
          </div>
          {notificationsOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="notification-panel"
            >
              <div className="notification-head">
                <strong>Notifications</strong>
                <span>3 new</span>
              </div>
              {notifications.map((n, i) => (
                <div className="notification" key={i}>
                  <div className={`notification-icon ${n.type}`}>
                    <Icon
                      name={
                        n.type === 'success'
                          ? 'check'
                          : n.type === 'warning'
                          ? 'alert'
                          : 'sparkles'
                      }
                      size={15}
                    />
                  </div>
                  <div>
                    <strong>{n.title}</strong>
                    <p>{n.text}</p>
                    <small>{n.time}</small>
                  </div>
                </div>
              ))}
              <Link to="/app/progress" className="notification-foot">
                View activity <Icon name="arrow" size={14} />
              </Link>
            </motion.div>
          )}
        </header>
        <main className="content">{children}</main>
      </div>
      <div
        className={`mobile-overlay ${mobileOpen ? 'show' : ''}`}
        onClick={() => setMobileOpen(false)}
      />
    </div>
  )
}

function titleFor(page: string) {
  const map: Record<string, string> = {
    dashboard: 'Overview',
    profile: 'My Profile',
    skills: 'Skills & Interests',
    evidence: 'Resume & Evidence',
    trust: 'Trust Center',
    careers: 'Career Matches',
    'career-detail': 'Career Detail',
    'skill-gaps': 'Skill Gaps',
    readiness: 'Job Readiness',
    roadmap: 'Career Roadmap',
    projects: 'Project Lab',
    simulator: 'What-If Simulator',
    coach: 'AI Career Coach',
    mentor: 'Mentor Review',
    market: 'Market Insights',
    progress: 'Progress',
    feedback: 'Feedback',
    'responsible-ai': 'Responsible AI',
    settings: 'Settings',
  }
  return map[page] || 'Overview'
}
