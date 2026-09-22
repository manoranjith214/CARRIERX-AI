import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import Icon from './Icon'

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral'|'violet'|'cyan'|'green'|'amber'|'rose' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function ProgressBar({ value, tone = 'violet', showValue = true }: { value: number; tone?: string; showValue?: boolean }) {
  return <div className="progress-wrap"><div className="progress-track"><div className={`progress-fill ${tone}`} style={{width: `${Math.max(0, Math.min(100, value))}%`}} /></div>{showValue && <span>{value}%</span>}</div>
}

export function StatCard({ label, value, trend, icon, tone = 'violet', note }: { label: string; value: string; trend?: string; icon: string; tone?: string; note?: string }) {
  return <motion.div whileHover={{ y: -3 }} className="card stat-card">
    <div className="stat-top"><div className={`icon-box ${tone}`}><Icon name={icon}/></div>{trend && <span className="trend-pill"><Icon name="trend" size={13}/>{trend}</span>}</div>
    <div className="stat-label">{label}</div><div className="stat-value">{value}</div>{note && <div className="stat-note">{note}</div>}
  </motion.div>
}

export function SectionHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="section-header"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action}</div>
}

export function EmptyState({ icon = 'sparkles', title, text, action }: { icon?: string; title: string; text: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon"><Icon name={icon} size={24}/></div><h3>{title}</h3><p>{text}</p>{action}</div>
}

export function MetricPill({ value, label, color = 'violet' }: { value: string; label: string; color?: string }) {
  return <div className="metric-pill"><span className={`metric-dot ${color}`}></span><strong>{value}</strong><span>{label}</span></div>
}

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null
  return <div className="modal-backdrop" onClick={onClose}><motion.div initial={{opacity:0, y:14, scale:.98}} animate={{opacity:1, y:0, scale:1}} className="modal" onClick={e => e.stopPropagation()}><div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose}><Icon name="x"/></button></div>{children}</motion.div></div>
}

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="toast"><Icon name="circlecheck" size={17}/><span>{message}</span><button onClick={onClose}><Icon name="x" size={14}/></button></motion.div>
}
