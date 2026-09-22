import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Icon from '../Icon'

interface RolePortalCardProps {
  role: 'student' | 'mentor' | 'admin'
  title: string
  subtitle: string
  description: string
  path: string
  actionLabel: string
  icon: string
  tone: 'violet' | 'cyan' | 'rose'
  features: string[]
}

export function RolePortalCard({
  title,
  subtitle,
  description,
  path,
  actionLabel,
  icon,
  tone,
  features,
}: RolePortalCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`role-portal-card card tone-${tone}`}
    >
      <div className="portal-card-top">
        <div className={`portal-icon-box ${tone}`}>
          <Icon name={icon} size={24} />
        </div>
        <span className={`badge badge-${tone}`}>{subtitle}</span>
      </div>

      <h2 className="portal-card-title">{title}</h2>
      <p className="portal-card-desc">{description}</p>

      <div className="portal-features-list">
        {features.map((f, i) => (
          <div key={i} className="portal-feature-item">
            <span className="bullet-dot" />
            <span>{f}</span>
          </div>
        ))}
      </div>

      <Link to={path} className={`primary-btn full portal-cta tone-${tone}`}>
        <span>{actionLabel}</span>
        <ArrowRight size={15} />
      </Link>
    </motion.div>
  )
}
