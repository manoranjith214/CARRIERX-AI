import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, PlayCircle, ShieldCheck } from 'lucide-react'
import Icon from '../components/Icon'

export function Landing() {
  return (
    <div className="public-page">
      <header className="public-nav">
        <Link to="/" className="brand">
          <div className="brand-mark">
            <Icon name="sparkles" size={18} />
          </div>
          <div>
            <strong>CareerX</strong>
            <span>AI</span>
          </div>
        </Link>
        <div className="public-links">
          <a href="#how">How it works</a>
          <a href="#portals">Portals</a>
          <a href="#intelligence">Intelligence</a>
          <a href="#trust">Trust</a>
          <a href="#coach">AI Coach</a>
        </div>
        <div className="public-actions">
          <Link to="/login" className="text-btn">
            Sign In
          </Link>
          <Link to="/signup/student" className="primary-btn">
            Get Started <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="pulse-dot" /> Trust-aware career intelligence
            </div>
            <h1>
              Your data.
              <br />
              <span>Your skills.</span>
              <br />
              Your career trajectory.
            </h1>
            <p>
              CareerX AI turns your academics, skills, projects, certifications and interests into an
              explainable career path — with evidence, gaps, readiness and a mentor loop to move forward.
            </p>
            <div className="hero-actions">
              <Link to="/signup/student" className="primary-btn big">
                Get Started <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="ghost-btn big">
                <PlayCircle size={17} /> Choose Portal
              </Link>
            </div>
            <div className="hero-trust">
              <span>
                <CheckCircle2 size={15} /> Evidence-aware
              </span>
              <span>
                <CheckCircle2 size={15} /> Explainable AI
              </span>
              <span>
                <CheckCircle2 size={15} /> Faculty & Mentor review
              </span>
            </div>
          </div>
          <HeroDashboard />
        </div>
      </section>

      <section className="capability-strip">
        <div>
          <strong>21</strong>
          <span>Connected product surfaces</span>
        </div>
        <div>
          <strong>360°</strong>
          <span>Career profile intelligence</span>
        </div>
        <div>
          <strong>3</strong>
          <span>Dedicated role portals</span>
        </div>
        <div>
          <strong>1</strong>
          <span>Personalized trajectory</span>
        </div>
      </section>

      <section id="portals" className="landing-section">
        <div className="center-heading">
          <span className="eyebrow">CHOOSE YOUR PORTAL</span>
          <h2>
            Tailored workspaces for <em>Students, Mentors & Admins</em>
          </h2>
          <p>Each stakeholder enters through a dedicated, secure role-specific portal.</p>
        </div>
        <div className="portals-teaser-grid">
          <div className="portal-teaser-card card">
            <div className="teaser-icon violet">
              <Icon name="grad" size={24} />
            </div>
            <span className="badge badge-violet">STUDENT PORTAL</span>
            <h3>Student Workspace</h3>
            <p>
              Access career recommendations, skill gap maps, project labs, what-if simulators, and
              contextual AI coaching.
            </p>
            <Link to="/login/student" className="primary-btn full">
              Student Login <ArrowRight size={15} />
            </Link>
          </div>

          <div className="portal-teaser-card card">
            <div className="teaser-icon cyan">
              <Icon name="hardhat" size={24} />
            </div>
            <span className="badge badge-cyan">MENTOR PORTAL</span>
            <h3>Faculty & Mentor Hub</h3>
            <p>
              Review 10 assigned students, validate evidence, recommend certifications & projects,
              and set measurable 30-day goals.
            </p>
            <Link to="/login/mentor" className="primary-btn full tone-cyan">
              Mentor Login <ArrowRight size={15} />
            </Link>
          </div>

          <div className="portal-teaser-card card">
            <div className="teaser-icon rose">
              <Icon name="shield" size={24} />
            </div>
            <span className="badge badge-rose">ADMIN PORTAL</span>
            <h3>Admin Command Center</h3>
            <p>
              Manage users, create mentor accounts, configure student-to-mentor assignments, and
              inspect security audit logs.
            </p>
            <Link to="/login/admin" className="primary-btn full tone-rose">
              Admin Login <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section id="how" className="landing-section">
        <div className="center-heading">
          <span className="eyebrow">How CareerX thinks</span>
          <h2>
            From profile data to a <em>career trajectory</em>
          </h2>
          <p>Every recommendation is assembled from multiple signals instead of relying on one score.</p>
        </div>
        <div className="pipeline">
          {[
            'Profile + Consent',
            'Evidence + Trust',
            'Career Matching',
            'Skill Gaps',
            'Roadmap + Outcomes',
          ].map((x, i) => (
            <motion.div whileHover={{ y: -5 }} key={x} className="pipeline-item">
              <div className="pipeline-num">0{i + 1}</div>
              <strong>{x}</strong>
              <p>
                {[
                  'Build a structured 360° career profile.',
                  'Separate verified, assessed and self-reported signals.',
                  'Blend semantic fit with skills and interests.',
                  'Prioritize the skills that move your target role.',
                  'Turn gaps into projects, learning and progress.',
                ][i]}
              </p>
              {i < 4 && <Icon name="arrow" size={16} />}
            </motion.div>
          ))}
        </div>
      </section>

      <section id="intelligence" className="landing-section dark-band">
        <div className="split-heading">
          <div>
            <span className="eyebrow">Career intelligence</span>
            <h2>See <em>why</em> a role fits, not just a percentage.</h2>
          </div>
          <p>
            CareerX surfaces match components, evidence confidence and the next missing skills so
            students can make informed career decisions.
          </p>
        </div>
        <div className="feature-grid">
          <FeatureCard
            icon="target"
            title="Explainable matching"
            text="Understand how skills, interests, projects, academics and market signals contribute to a career match."
          />
          <FeatureCard
            icon="shield"
            title="Evidence-aware profiles"
            text="Separate verified evidence from self-reported information and flag items for review without labelling students as fake."
          />
          <FeatureCard
            icon="bar"
            title="Actionable skill gaps"
            text="See the precise gap between your current capability and the target role — then get a practical route to close it."
          />
          <FeatureCard
            icon="wand"
            title="What-if simulation"
            text="Test the impact of a new skill, certification or project before investing the time to build it."
          />
        </div>
      </section>

      <section id="trust" className="landing-section trust-section">
        <div className="trust-copy">
          <span className="eyebrow">Trust center</span>
          <h2>
            Career recommendations should show their <em>evidence.</em>
          </h2>
          <p>
            CareerX makes confidence visible: verified, assessed, self-reported and needs-review
            evidence are tracked separately.
          </p>
          <div className="trust-list">
            <span>
              <CheckCircle2 /> Verified evidence
            </span>
            <span>
              <CheckCircle2 /> Assessment-backed skills
            </span>
            <span>
              <CheckCircle2 /> Project evidence
            </span>
            <span>
              <CheckCircle2 /> Mentor review
            </span>
          </div>
        </div>
        <div className="trust-card">
          <div className="trust-score-ring">
            <strong>91</strong>
            <span>evidence confidence</span>
          </div>
          <div className="evidence-bars">
            <Bar label="Verified" value={72} tone="violet" />
            <Bar label="Assessed" value={14} tone="cyan" />
            <Bar label="Self reported" value={9} tone="amber" />
            <Bar label="Needs review" value={5} tone="rose" />
          </div>
        </div>
      </section>

      <section id="coach" className="landing-section coach-banner">
        <div>
          <span className="eyebrow">Career coach</span>
          <h2>
            A career copilot that knows your <em>context.</em>
          </h2>
          <p>
            Ask why a career matches, what to learn next, which project closes your gap or how your
            readiness has changed.
          </p>
        </div>
        <div className="chat-preview">
          <div className="chat-head">
            <div className="ai-dot">
              <Icon name="brain" size={16} />
            </div>
            <div>
              <strong>CareerX AI Coach</strong>
              <span>Context-aware</span>
            </div>
            <span className="online">●</span>
          </div>
          <div className="chat-bubble ai">
            Your strongest next step is Deep Learning. It closes a high-priority gap for your AI / ML
            Engineer target and can raise your project readiness.
          </div>
          <div className="chat-bubble user">Why is that more important than Docker right now?</div>
          <div className="typing">
            <span /> <span /> <span />
          </div>
        </div>
      </section>

      <footer className="public-footer">
        <div className="brand">
          <div className="brand-mark">
            <Icon name="sparkles" size={18} />
          </div>
          <div>
            <strong>CareerX</strong>
            <span>AI</span>
          </div>
        </div>
        <span>Trust-aware career intelligence for the next generation.</span>
        <span>© 2026 CareerX AI</span>
      </footer>
    </div>
  )
}

function HeroDashboard() {
  return (
    <div className="hero-visual">
      <div className="hero-glow" />
      <div className="window-card">
        <div className="window-top">
          <span />
          <span />
          <span />
          <div>Career Intelligence</div>
          <Icon name="more" size={16} />
        </div>
        <div className="window-body">
          <div className="hero-stat-row">
            <div>
              <span>Top career match</span>
              <strong>AI / ML Engineer</strong>
              <small>High confidence</small>
            </div>
            <div className="score-dial">
              <span>92</span>
              <small>% match</small>
            </div>
          </div>
          <div className="mini-grid">
            <div className="mini-card">
              <span>Profile trust</span>
              <strong>91%</strong>
              <div className="mini-line">
                <i style={{ width: '91%' }} />
              </div>
            </div>
            <div className="mini-card">
              <span>Readiness</span>
              <strong>78%</strong>
              <div className="mini-line cyan">
                <i style={{ width: '78%' }} />
              </div>
            </div>
            <div className="mini-card wide">
              <span>Skill alignment</span>
              <div className="bars">
                <i style={{ height: '50%' }} />
                <i style={{ height: '78%' }} />
                <i style={{ height: '64%' }} />
                <i style={{ height: '92%' }} />
                <i style={{ height: '74%' }} />
                <i style={{ height: '84%' }} />
              </div>
            </div>
          </div>
          <div className="hero-list">
            <div>
              <span>
                <b className="dot violet" /> Python
              </span>
              <strong>92</strong>
            </div>
            <div>
              <span>
                <b className="dot cyan" /> Machine Learning
              </span>
              <strong>71</strong>
            </div>
            <div>
              <span>
                <b className="dot amber" /> Docker
              </span>
              <strong className="muted">32</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <Icon name={icon} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <span className="feature-link">
        Explore <ArrowRight size={14} />
      </span>
    </div>
  )
}

function Bar({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="evidence-bar">
      <div>
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="progress-track">
        <div className={`progress-fill ${tone}`} style={{ width: value + '%' }} />
      </div>
    </div>
  )
}
