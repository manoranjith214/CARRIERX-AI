import type React from 'react'
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, Award, BarChart3, Bell, BookOpen,
  BrainCircuit, BriefcaseBusiness, Check, CheckCircle2, ChevronDown, CircleHelp, ClipboardCheck,
  Cloud, Code2, Database, FileCheck2, FileText, FolderKanban, Gauge, GraduationCap, Grid2X2,
  HardHat, Headphones, History, LayoutDashboard, Lightbulb, LockKeyhole, LogOut, Menu, MessageCircle,
  MoreHorizontal, PanelLeftClose, PanelLeftOpen, Plus, Rocket, Search, Settings, ShieldCheck, Sparkles,
  Target, TrendingUp, UploadCloud, UserRound, UsersRound, WandSparkles, X, Zap, Box, Download
} from 'lucide-react'

const icons: Record<string, React.ComponentType<{size?: number; strokeWidth?: number; className?: string}>> = {
  activity: Activity, alert: AlertTriangle, arrow: ArrowRight, down: ArrowDownRight, award: Award,
  bar: BarChart3, bell: Bell, book: BookOpen, brain: BrainCircuit, briefcase: BriefcaseBusiness,
  check: Check, circlecheck: CheckCircle2, chevron: ChevronDown, help: CircleHelp, clipboard: ClipboardCheck,
  cloud: Cloud, code: Code2, database: Database, filecheck: FileCheck2, file: FileText, folder: FolderKanban,
  gauge: Gauge, grad: GraduationCap, grid: Grid2X2, hardhat: HardHat, headset: Headphones, history: History,
  dashboard: LayoutDashboard, lightbulb: Lightbulb, lock: LockKeyhole, logout: LogOut, menu: Menu,
  message: MessageCircle, more: MoreHorizontal, closeleft: PanelLeftClose, openleft: PanelLeftOpen, plus: Plus,
  rocket: Rocket, search: Search, settings: Settings, shield: ShieldCheck, sparkles: Sparkles, target: Target,
  trend: TrendingUp, upload: UploadCloud, user: UserRound, users: UsersRound, wand: WandSparkles, x: X, zap: Zap, box: Box, download: Download
}

export default function Icon({ name, size = 18, strokeWidth = 1.8, className }: { name: string; size?: number; strokeWidth?: number; className?: string }) {
  const C = icons[name] || Sparkles
  return <C size={size} strokeWidth={strokeWidth} className={className} />
}
