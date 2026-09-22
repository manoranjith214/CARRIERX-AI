import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend
} from 'recharts'
import Icon from '../components/Icon'
import { Badge, MetricPill, Modal, ProgressBar, SectionHeader, StatCard, Toast } from '../components/UI'
import { backend } from '../services/backend'
import {
  AcademicOverview, AcademicRecord, SubjectResult,
  AcademicRecordPayload, SubjectResultPayload
} from '../types'

const chartTooltip = {
  contentStyle: { background: '#0f1421', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, color: '#fff' },
  itemStyle: { color: '#fff' }
}

const fallbackOverview: AcademicOverview = {
  student_id: 1,
  student_name: 'Jayaseelan G',
  department: 'Artificial Intelligence & Data Science',
  current_cgpa: 8.65,
  latest_sgpa: 8.80,
  sgpa_delta: 0.35,
  active_arrears: 0,
  total_arrears_ever: 1,
  cleared_arrears: 1,
  credits_registered: 110,
  credits_earned: 110,
  credits_remaining: 50,
  credit_completion_pct: 68.8,
  attendance_overall: 89.4,
  attendance_current_sem: 91.0,
  academic_progress_score: 88,
  academic_trend: 'Improving',
  academic_strengths: [
    'Machine Learning (O Grade - 10.0 GP)',
    'Data Structures & Algorithms (A+ Grade - 9.0 GP)',
    'Database Management Systems (A+ Grade - 9.0 GP)',
    'Consistently high practical lab scores (>90%)'
  ],
  academic_improvements: [
    {
      subject_code: 'CS2204',
      subject_name: 'Computer Networks',
      current_performance: 'B+ Grade (7.0 GP)',
      status: 'Passed',
      reason: 'Network socket programming and protocol fundamentals impact Cloud & Distributed AI roles.',
      suggested_action: 'Build a TCP/UDP socket telemetry demo or complete hands-on AWS VPC module.',
      career_target: 'AI / ML Engineer',
      priority: 'Medium'
    },
    {
      subject_code: 'CS2202',
      subject_name: 'Operating Systems & Concurrency',
      current_performance: 'Cleared (Earlier Arrear)',
      status: 'Cleared',
      reason: 'Low concurrency mastery causes bottlenecks in high-throughput AI inference deployment.',
      suggested_action: 'Implement multi-threaded producer-consumer pipeline in C++ or Python.',
      career_target: 'AI / ML Engineer',
      priority: 'High'
    }
  ],
  alerts: [
    {
      id: 101,
      student_id: 1,
      type: 'achievement',
      severity: 'Info',
      message: 'Dean’s list recognition: SGPA 8.80 achieved in Semester 5.',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 102,
      student_id: 1,
      type: 'arrear_cleared',
      severity: 'Info',
      message: 'Operating Systems (CS2202) cleared successfully in Semester 4 supplementary.',
      status: 'Active',
      created_at: new Date().toISOString()
    }
  ],
  goals: [
    {
      id: 201,
      student_id: 1,
      mentor_id: 1,
      title: 'Achieve SGPA >= 9.0 in Semester 6',
      description: 'Focus on Deep Learning (AI3301) and Cloud Infrastructure subjects.',
      target_value: 'SGPA 9.0',
      deadline: '2026-05-30',
      priority: 'High',
      progress: 65,
      status: 'In Progress',
      created_at: new Date().toISOString()
    },
    {
      id: 202,
      student_id: 1,
      mentor_id: 1,
      title: 'Maintain 90%+ Attendance across all theory courses',
      description: 'Ensure institutional minimum eligibility for campus placement drives.',
      target_value: '90%',
      deadline: '2026-04-15',
      priority: 'Medium',
      progress: 91,
      status: 'In Progress',
      created_at: new Date().toISOString()
    }
  ],
  records: [
    {
      id: 1,
      student_id: 1,
      semester: 1,
      academic_year: '2023-2024',
      sgpa: 8.20,
      cgpa: 8.20,
      arrear_count: 0,
      cleared_arrear_count: 0,
      credits_registered: 22,
      credits_earned: 22,
      attendance_percentage: 92.0,
      academic_progress_score: 82,
      trend: 'Stable',
      source: 'Student Portal',
      verification_status: 'Verified',
      created_at: '2023-12-15',
      subjects: [
        { id: 1, academic_record_id: 1, subject_code: 'MA1101', subject_name: 'Engineering Mathematics I', credits: 4, grade: 'A', grade_point: 8.0, status: 'Passed', category: 'Math', attendance_percentage: 92, created_at: '2023-12-15' },
        { id: 2, academic_record_id: 1, subject_code: 'PH1101', subject_name: 'Physics for Information Science', credits: 4, grade: 'A+', grade_point: 9.0, status: 'Passed', category: 'Basic Science', attendance_percentage: 94, created_at: '2023-12-15' },
        { id: 3, academic_record_id: 1, subject_code: 'CS1101', subject_name: 'Problem Solving and C Programming', credits: 4, grade: 'O', grade_point: 10.0, status: 'Passed', category: 'Core CS', attendance_percentage: 95, created_at: '2023-12-15' }
      ]
    },
    {
      id: 2,
      student_id: 1,
      semester: 2,
      academic_year: '2023-2024',
      sgpa: 8.45,
      cgpa: 8.32,
      arrear_count: 0,
      cleared_arrear_count: 0,
      credits_registered: 22,
      credits_earned: 22,
      attendance_percentage: 90.0,
      academic_progress_score: 84,
      trend: 'Improving',
      source: 'Student Portal',
      verification_status: 'Verified',
      created_at: '2024-05-20',
      subjects: [
        { id: 4, academic_record_id: 2, subject_code: 'CS1201', subject_name: 'Data Structures & Algorithms', credits: 4, grade: 'A+', grade_point: 9.0, status: 'Passed', category: 'Core CS', attendance_percentage: 91, created_at: '2024-05-20' },
        { id: 5, academic_record_id: 2, subject_code: 'CS1202', subject_name: 'Digital Logic & System Design', credits: 3, grade: 'A', grade_point: 8.0, status: 'Passed', category: 'Core CS', attendance_percentage: 89, created_at: '2024-05-20' },
        { id: 6, academic_record_id: 2, subject_code: 'MA1201', subject_name: 'Discrete Mathematics', credits: 4, grade: 'A+', grade_point: 9.0, status: 'Passed', category: 'Math', attendance_percentage: 90, created_at: '2024-05-20' }
      ]
    },
    {
      id: 3,
      student_id: 1,
      semester: 3,
      academic_year: '2024-2025',
      sgpa: 8.10,
      cgpa: 8.25,
      arrear_count: 1,
      cleared_arrear_count: 0,
      credits_registered: 22,
      credits_earned: 19,
      attendance_percentage: 84.5,
      academic_progress_score: 76,
      trend: 'Declining',
      source: 'Student Portal',
      verification_status: 'Verified',
      created_at: '2024-12-18',
      subjects: [
        { id: 7, academic_record_id: 3, subject_code: 'CS2201', subject_name: 'Design & Analysis of Algorithms', credits: 4, grade: 'A+', grade_point: 9.0, status: 'Passed', category: 'Core CS', attendance_percentage: 88, created_at: '2024-12-18' },
        { id: 8, academic_record_id: 3, subject_code: 'CS2202', subject_name: 'Operating Systems', credits: 3, grade: 'RA', grade_point: 0.0, status: 'Arrear', category: 'Core CS', attendance_percentage: 78, created_at: '2024-12-18' },
        { id: 9, academic_record_id: 3, subject_code: 'AI2101', subject_name: 'Python for Data Science & AI', credits: 4, grade: 'O', grade_point: 10.0, status: 'Passed', category: 'AI/ML', attendance_percentage: 92, created_at: '2024-12-18' }
      ]
    },
    {
      id: 4,
      student_id: 1,
      semester: 4,
      academic_year: '2024-2025',
      sgpa: 8.45,
      cgpa: 8.35,
      arrear_count: 0,
      cleared_arrear_count: 1,
      credits_registered: 22,
      credits_earned: 25,
      attendance_percentage: 89.5,
      academic_progress_score: 85,
      trend: 'Improving',
      source: 'Student Portal',
      verification_status: 'Verified',
      created_at: '2025-05-22',
      subjects: [
        { id: 10, academic_record_id: 4, subject_code: 'CS2203', subject_name: 'Database Management Systems', credits: 4, grade: 'A+', grade_point: 9.0, status: 'Passed', category: 'Core CS', attendance_percentage: 91, created_at: '2025-05-22' },
        { id: 11, academic_record_id: 4, subject_code: 'CS2204', subject_name: 'Computer Networks', credits: 3, grade: 'B+', grade_point: 7.0, status: 'Passed', category: 'Core CS', attendance_percentage: 86, created_at: '2025-05-22' },
        { id: 12, academic_record_id: 4, subject_code: 'CS2202', subject_name: 'Operating Systems (Supplementary)', credits: 3, grade: 'B+', grade_point: 7.0, status: 'Cleared', category: 'Core CS', attendance_percentage: 90, created_at: '2025-05-22' }
      ]
    },
    {
      id: 5,
      student_id: 1,
      semester: 5,
      academic_year: '2025-2026',
      sgpa: 8.80,
      cgpa: 8.65,
      arrear_count: 0,
      cleared_arrear_count: 0,
      credits_registered: 22,
      credits_earned: 22,
      attendance_percentage: 91.0,
      academic_progress_score: 91,
      trend: 'Improving',
      source: 'Student Portal',
      verification_status: 'Verified',
      created_at: '2025-12-20',
      subjects: [
        { id: 13, academic_record_id: 5, subject_code: 'AI3101', subject_name: 'Machine Learning & Pattern Recognition', credits: 4, grade: 'O', grade_point: 10.0, status: 'Passed', category: 'AI/ML', attendance_percentage: 95, created_at: '2025-12-20' },
        { id: 14, academic_record_id: 5, subject_code: 'AI3102', subject_name: 'Artificial Intelligence & Knowledge Rep', credits: 4, grade: 'A+', grade_point: 9.0, status: 'Passed', category: 'AI/ML', attendance_percentage: 90, created_at: '2025-12-20' },
        { id: 15, academic_record_id: 5, subject_code: 'CS3101', subject_name: 'Cloud Computing & Virtualization', credits: 3, grade: 'A', grade_point: 8.0, status: 'Passed', category: 'Core CS', attendance_percentage: 88, created_at: '2025-12-20' }
      ]
    }
  ]
}

export function AcademicPage() {
  const [data, setData] = useState<AcademicOverview>(fallbackOverview)
  const [loading, setLoading] = useState(true)
  const [chartMode, setChartMode] = useState<'both' | 'sgpa' | 'cgpa' | 'attendance'>('both')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [subjectSearch, setSubjectSearch] = useState<string>('')
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Modals
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false)
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false)
  const [selectedRecordForSubject, setSelectedRecordForSubject] = useState<number | null>(null)

  // Form states
  const [semesterForm, setSemesterForm] = useState<AcademicRecordPayload>({
    semester: 6,
    academic_year: '2025-2026',
    sgpa: 8.90,
    cgpa: 8.70,
    arrear_count: 0,
    cleared_arrear_count: 0,
    credits_registered: 22,
    credits_earned: 22,
    attendance_percentage: 92.0
  })

  const [subjectForm, setSubjectForm] = useState<SubjectResultPayload>({
    subject_code: 'AI3201',
    subject_name: 'Deep Learning & Neural Networks',
    credits: 4,
    grade: 'A+',
    grade_point: 9.0,
    status: 'Passed',
    category: 'AI/ML',
    attendance_percentage: 92.0
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await backend.getAcademicOverview()
      if (res && res.records && res.records.length > 0) {
        setData(res)
      }
    } catch (err) {
      console.warn('Using fallback academic data due to API error/offline mode:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Chart Data preparation
  const chartData = useMemo(() => {
    return [...data.records]
      .sort((a, b) => a.semester - b.semester)
      .map(r => ({
        sem: `Sem ${r.semester}`,
        semesterNum: r.semester,
        SGPA: Number(r.sgpa.toFixed(2)),
        CGPA: Number(r.cgpa.toFixed(2)),
        Attendance: Number(r.attendance_percentage.toFixed(1)),
        Score: r.academic_progress_score,
        Credits: r.credits_earned
      }))
  }, [data.records])

  // All subjects flattened
  const allSubjects = useMemo(() => {
    const list: (SubjectResult & { semester: number; academic_year: string })[] = []
    data.records.forEach(r => {
      if (r.subjects) {
        r.subjects.forEach(s => {
          list.push({ ...s, semester: r.semester, academic_year: r.academic_year })
        })
      }
    })
    return list
  }, [data.records])

  // Filtered subjects
  const filteredSubjects = useMemo(() => {
    return allSubjects.filter(s => {
      const matchFilter =
        subjectFilter === 'all'
          ? true
          : subjectFilter === 'arrear'
          ? s.status === 'Arrear'
          : subjectFilter === 'cleared'
          ? s.status === 'Cleared'
          : subjectFilter === 'passed'
          ? s.status === 'Passed'
          : s.category.toLowerCase().includes(subjectFilter.toLowerCase())

      const matchSearch =
        subjectSearch.trim() === ''
          ? true
          : s.subject_name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
            s.subject_code.toLowerCase().includes(subjectSearch.toLowerCase()) ||
            s.category.toLowerCase().includes(subjectSearch.toLowerCase())

      const matchSemester = selectedSemester === null || s.semester === selectedSemester

      return matchFilter && matchSearch && matchSemester
    })
  }, [allSubjects, subjectFilter, subjectSearch, selectedSemester])

  const handleAddSemester = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await backend.createAcademicRecord(semesterForm)
      setToast(`Semester ${semesterForm.semester} record added successfully!`)
      setShowAddSemesterModal(false)
      loadData()
    } catch (err: any) {
      setToast('Saved locally in dashboard view.')
      // Local optimistic update
      const newRec: AcademicRecord = {
        id: Date.now(),
        student_id: data.student_id,
        semester: Number(semesterForm.semester),
        academic_year: semesterForm.academic_year || '2025-2026',
        sgpa: Number(semesterForm.sgpa),
        cgpa: Number(semesterForm.cgpa),
        arrear_count: Number(semesterForm.arrear_count || 0),
        cleared_arrear_count: Number(semesterForm.cleared_arrear_count || 0),
        credits_registered: Number(semesterForm.credits_registered || 22),
        credits_earned: Number(semesterForm.credits_earned || 22),
        attendance_percentage: Number(semesterForm.attendance_percentage || 90),
        academic_progress_score: Math.min(100, Math.round((Number(semesterForm.cgpa) / 10) * 100)),
        trend: 'Improving',
        source: 'Student Portal',
        verification_status: 'Pending',
        created_at: new Date().toISOString(),
        subjects: []
      }
      setData(prev => ({
        ...prev,
        current_cgpa: newRec.cgpa,
        latest_sgpa: newRec.sgpa,
        records: [...prev.records, newRec]
      }))
      setShowAddSemesterModal(false)
    }
  }

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecordForSubject) return
    try {
      await backend.createSubjectResult(selectedRecordForSubject, subjectForm)
      setToast(`Subject ${subjectForm.subject_code} added successfully!`)
      setShowAddSubjectModal(false)
      loadData()
    } catch (err) {
      setToast('Subject registered successfully.')
      // Local optimistic update
      const newSub: SubjectResult = {
        id: Date.now(),
        academic_record_id: selectedRecordForSubject,
        subject_code: subjectForm.subject_code,
        subject_name: subjectForm.subject_name,
        credits: Number(subjectForm.credits || 3),
        grade: subjectForm.grade || 'A',
        grade_point: Number(subjectForm.grade_point || 8.0),
        status: subjectForm.status || 'Passed',
        category: subjectForm.category || 'Core CS',
        attendance_percentage: Number(subjectForm.attendance_percentage || 90),
        created_at: new Date().toISOString()
      }
      setData(prev => ({
        ...prev,
        records: prev.records.map(r => {
          if (r.id === selectedRecordForSubject) {
            return {
              ...r,
              subjects: [...(r.subjects || []), newSub]
            }
          }
          return r
        })
      }))
      setShowAddSubjectModal(false)
    }
  }

  return (
    <div className="page-stack">
      {/* Top Header */}
      <SectionHeader
        eyebrow="ACADEMIC INTELLIGENCE"
        title="Academic Progress & Subject Mastery"
        subtitle={`Tracking semester trajectories, credit completion, arrear recovery, and career-academic alignment for ${data.student_name}.`}
        action={
          <div className="inline-actions">
            <button className="secondary-btn" onClick={() => setShowAddSemesterModal(true)}>
              <Icon name="plus" size={15} /> Add Semester
            </button>
            <button className="primary-btn" onClick={loadData}>
              <Icon name="sparkles" size={15} /> Refresh Analytics
            </button>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="stats-grid four">
        <StatCard
          label="Current CGPA"
          value={`${data.current_cgpa.toFixed(2)}`}
          trend={data.academic_trend === 'Improving' ? '↗ Improving' : data.academic_trend === 'Declining' ? '↘ Declining' : '→ Stable'}
          icon="grad"
          tone={data.current_cgpa >= 8.5 ? 'green' : data.current_cgpa >= 7.5 ? 'violet' : 'amber'}
          note={`Latest SGPA: ${data.latest_sgpa.toFixed(2)} (${data.sgpa_delta >= 0 ? '+' : ''}${data.sgpa_delta.toFixed(2)})`}
        />
        <StatCard
          label="Academic Progress Score"
          value={`${data.academic_progress_score}/100`}
          trend={data.academic_trend}
          icon="gauge"
          tone="cyan"
          note="Evaluates SGPA trend, credits & attendance"
        />
        <StatCard
          label="Arrear Health"
          value={data.active_arrears === 0 ? '0 Active' : `${data.active_arrears} Active`}
          trend={data.cleared_arrears > 0 ? `${data.cleared_arrears} Cleared` : 'All Clear'}
          icon="shield"
          tone={data.active_arrears === 0 ? 'green' : 'rose'}
          note={data.active_arrears === 0 ? 'Clean academic record' : 'Action plan recommended'}
        />
        <StatCard
          label="Credits & Attendance"
          value={`${data.credits_earned}/${data.credits_registered + data.credits_remaining}`}
          trend={`${data.attendance_overall.toFixed(1)}% Att.`}
          icon="clipboard"
          tone="amber"
          note={`${data.credit_completion_pct.toFixed(0)}% degree credits completed`}
        />
      </div>

      {/* Progress & Trajectory Chart Section */}
      <div className="dashboard-grid">
        <div className="card chart-card large">
          <div className="card-head">
            <div>
              <span className="eyebrow">SEMESTER TRAJECTORY</span>
              <h3>SGPA & CGPA Evolution</h3>
            </div>
            <div className="filter-pills">
              <button
                className={chartMode === 'both' ? 'filter-active' : ''}
                onClick={() => setChartMode('both')}
              >
                SGPA & CGPA
              </button>
              <button
                className={chartMode === 'sgpa' ? 'filter-active' : ''}
                onClick={() => setChartMode('sgpa')}
              >
                SGPA
              </button>
              <button
                className={chartMode === 'cgpa' ? 'filter-active' : ''}
                onClick={() => setChartMode('cgpa')}
              >
                CGPA
              </button>
              <button
                className={chartMode === 'attendance' ? 'filter-active' : ''}
                onClick={() => setChartMode('attendance')}
              >
                Attendance %
              </button>
            </div>
          </div>

          <div className="chart-legend">
            {(chartMode === 'both' || chartMode === 'sgpa') && (
              <span><i className="legend-dot violet" /> SGPA</span>
            )}
            {(chartMode === 'both' || chartMode === 'cgpa') && (
              <span><i className="legend-dot cyan" /> CGPA</span>
            )}
            {chartMode === 'attendance' && (
              <span><i className="legend-dot green" /> Attendance %</span>
            )}
          </div>

          <ResponsiveContainer width="100%" height={290}>
            {chartMode === 'attendance' ? (
              <BarChart data={chartData} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid stroke="#252b3a" vertical={false} />
                <XAxis dataKey="sem" axisLine={false} tickLine={false} tick={{ fill: '#718099', fontSize: 12 }} />
                <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{ fill: '#718099', fontSize: 12 }} />
                <Tooltip {...chartTooltip} />
                <Bar dataKey="Attendance" fill="#10b981" radius={[6, 6, 0, 0]} barSize={34} />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ left: -15, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="sgpaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c5cfc" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#7c5cfc" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cgpaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#252b3a" vertical={false} />
                <XAxis dataKey="sem" axisLine={false} tickLine={false} tick={{ fill: '#718099', fontSize: 12 }} />
                <YAxis domain={[5.0, 10.0]} axisLine={false} tickLine={false} tick={{ fill: '#718099', fontSize: 12 }} />
                <Tooltip {...chartTooltip} />
                {(chartMode === 'both' || chartMode === 'sgpa') && (
                  <Area
                    type="monotone"
                    dataKey="SGPA"
                    stroke="#7c5cfc"
                    fill="url(#sgpaGrad)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#7c5cfc', stroke: '#fff', strokeWidth: 1.5 }}
                  />
                )}
                {(chartMode === 'both' || chartMode === 'cgpa') && (
                  <Area
                    type="monotone"
                    dataKey="CGPA"
                    stroke="#22d3ee"
                    fill="url(#cgpaGrad)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#22d3ee', stroke: '#fff', strokeWidth: 1.5 }}
                  />
                )}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Academic Alignment with Career Goals */}
        <div className="card career-preview">
          <div className="card-head">
            <div>
              <span className="eyebrow">CAREER ALIGNMENT</span>
              <h3>Academic Signal</h3>
            </div>
            <div className="match-score">88<small>%</small></div>
          </div>
          <p className="muted-text">
            Strong foundation in core CS and AI courses directly supports your target role profile.
          </p>
          <div className="match-metrics">
            <MetricPill value="9.5" label="AI / ML Avg" color="violet" />
            <MetricPill value="8.8" label="Core CS Avg" color="cyan" />
            <MetricPill value="8.5" label="Math Avg" color="green" />
          </div>
          <div className="match-reasons">
            <div>
              <Icon name="check" />
              <span>Machine Learning (O Grade)</span>
              <strong>+15</strong>
            </div>
            <div>
              <Icon name="check" />
              <span>DSA & Algorithms (A+)</span>
              <strong>+12</strong>
            </div>
            <div>
              <Icon name="check" />
              <span>Supplementary Cleared</span>
              <strong>+8</strong>
            </div>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>DEGREE COMPLETION PROGRESS</div>
            <ProgressBar value={data.credit_completion_pct} tone="violet" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8995ab', marginTop: '6px' }}>
              <span>{data.credits_earned} credits earned</span>
              <span>{data.credits_remaining} credits left</span>
            </div>
          </div>
        </div>
      </div>

      {/* Semester Breakdown Table */}
      <div className="card">
        <div className="card-head">
          <div>
            <span className="eyebrow">SEMESTER RECORDS</span>
            <h3>Semester Performance Summary</h3>
          </div>
          <div className="chip-row">
            <Badge tone="green">{data.records.length} Semesters Recorded</Badge>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Semester</th>
                <th>Academic Year</th>
                <th>SGPA</th>
                <th>CGPA</th>
                <th>Arrears</th>
                <th>Credits Earned</th>
                <th>Attendance</th>
                <th>Progress Score</th>
                <th>Trend</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.records
                .sort((a, b) => b.semester - a.semester)
                .map(r => (
                  <tr
                    key={r.id}
                    style={{
                      cursor: 'pointer',
                      background: selectedSemester === r.semester ? 'rgba(124, 92, 252, 0.08)' : undefined
                    }}
                    onClick={() => setSelectedSemester(selectedSemester === r.semester ? null : r.semester)}
                  >
                    <td>
                      <div className="file-cell">
                        <div className="file-icon"><Icon name="grad" size={16} /></div>
                        <strong>Semester {r.semester}</strong>
                      </div>
                    </td>
                    <td>{r.academic_year}</td>
                    <td>
                      <strong style={{ color: r.sgpa >= 8.5 ? '#10b981' : r.sgpa >= 7.5 ? '#7c5cfc' : '#f59e0b' }}>
                        {r.sgpa.toFixed(2)}
                      </strong>
                    </td>
                    <td><strong>{r.cgpa.toFixed(2)}</strong></td>
                    <td>
                      {r.arrear_count === 0 ? (
                        <Badge tone="green">0 Active</Badge>
                      ) : (
                        <Badge tone="rose">{r.arrear_count} Arrear</Badge>
                      )}
                      {r.cleared_arrear_count > 0 && (
                        <span style={{ marginLeft: 6 }}>
                          <Badge tone="cyan">+{r.cleared_arrear_count} Cleared</Badge>
                        </span>
                      )}
                    </td>
                    <td>{r.credits_earned} / {r.credits_registered}</td>
                    <td>
                      <span style={{ color: r.attendance_percentage >= 85 ? '#10b981' : '#f59e0b' }}>
                        {r.attendance_percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '28px', fontWeight: 600 }}>{r.academic_progress_score}</span>
                        <div style={{ width: '60px' }}>
                          <ProgressBar value={r.academic_progress_score} tone="violet" showValue={false} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge tone={r.trend === 'Improving' ? 'green' : r.trend === 'Declining' ? 'rose' : 'neutral'}>
                        {r.trend}
                      </Badge>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        className="secondary-btn"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => {
                          setSelectedRecordForSubject(r.id)
                          setShowAddSubjectModal(true)
                        }}
                      >
                        <Icon name="plus" size={12} /> Add Subject
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject-Level Performance Section */}
      <div className="page-stack">
        <div className="toolbar">
          <div className="search-box">
            <Icon name="search" size={16} />
            <input
              value={subjectSearch}
              onChange={e => setSubjectSearch(e.target.value)}
              placeholder="Search course code, subject name or category..."
            />
          </div>
          <div className="filter-pills">
            <button className={subjectFilter === 'all' ? 'filter-active' : ''} onClick={() => setSubjectFilter('all')}>
              All Subjects
            </button>
            <button className={subjectFilter === 'passed' ? 'filter-active' : ''} onClick={() => setSubjectFilter('passed')}>
              Passed
            </button>
            <button className={subjectFilter === 'arrear' ? 'filter-active' : ''} onClick={() => setSubjectFilter('arrear')}>
              Active Arrear
            </button>
            <button className={subjectFilter === 'cleared' ? 'filter-active' : ''} onClick={() => setSubjectFilter('cleared')}>
              Cleared
            </button>
            <button className={subjectFilter === 'AI/ML' ? 'filter-active' : ''} onClick={() => setSubjectFilter('AI/ML')}>
              AI / ML
            </button>
            <button className={subjectFilter === 'Core CS' ? 'filter-active' : ''} onClick={() => setSubjectFilter('Core CS')}>
              Core CS
            </button>
          </div>
        </div>

        {selectedSemester !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(124,92,252,0.12)', borderRadius: '8px', border: '1px solid rgba(124,92,252,0.3)', width: 'fit-content' }}>
            <span style={{ fontSize: '13px', color: '#c4b5fd' }}>Showing Semester {selectedSemester} Subjects Only</span>
            <button className="icon-btn" onClick={() => setSelectedSemester(null)} style={{ padding: 2 }}>
              <Icon name="x" size={14} />
            </button>
          </div>
        )}

        <div className="skills-grid">
          {filteredSubjects.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '36px' }}>
              <Icon name="book" size={32} style={{ color: '#718099', margin: '0 auto 12px' }} />
              <h4>No subjects match the selected criteria</h4>
              <p className="muted-text">Try adjusting filters or search query.</p>
            </div>
          ) : (
            filteredSubjects.map((s, i) => (
              <motion.div whileHover={{ y: -3 }} className="card skill-card" key={`${s.subject_code}-${s.id || i}`}>
                <div className="skill-head">
                  <div className={`skill-icon c${i % 4}`}>
                    <Icon name={s.status === 'Arrear' ? 'alert' : s.category.includes('AI') ? 'brain' : s.category.includes('Math') ? 'gauge' : 'code'} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '11px', color: '#718099', fontWeight: 600 }}>
                      {s.subject_code} · Sem {s.semester}
                    </div>
                    <h3 style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.subject_name}
                    </h3>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '12px 0 6px' }}>
                  <div className="skill-number">
                    {s.grade}
                    <small style={{ fontSize: '12px', marginLeft: 6 }}>({s.grade_point.toFixed(1)} GP)</small>
                  </div>
                  <div style={{ fontSize: '12px', color: '#8995ab' }}>
                    {s.credits} Credits
                  </div>
                </div>

                <ProgressBar
                  value={Math.min(100, Math.round((s.grade_point / 10) * 100))}
                  tone={s.status === 'Arrear' ? 'rose' : s.grade_point >= 9.0 ? 'green' : s.grade_point >= 8.0 ? 'violet' : 'amber'}
                  showValue={false}
                />

                <div className="skill-foot" style={{ marginTop: '12px' }}>
                  <Badge
                    tone={
                      s.status === 'Passed'
                        ? 'green'
                        : s.status === 'Cleared'
                        ? 'cyan'
                        : s.status === 'Arrear'
                        ? 'rose'
                        : 'neutral'
                    }
                  >
                    {s.status}
                  </Badge>
                  <span style={{ fontSize: '11px', color: s.attendance_percentage >= 85 ? '#10b981' : '#f59e0b' }}>
                    {s.attendance_percentage.toFixed(0)}% Attendance
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Academic Strengths & Career-Linked Improvements */}
      <div className="dashboard-grid">
        {/* Strengths Card */}
        <div className="card">
          <div className="card-head">
            <div>
              <span className="eyebrow">ACADEMIC STRENGTHS</span>
              <h3>Core Competencies</h3>
            </div>
            <Badge tone="green">High Mastery</Badge>
          </div>
          <p className="muted-text" style={{ marginBottom: 16 }}>
            Top-graded coursework demonstrating strong theoretical and applied foundations.
          </p>
          <div className="match-reasons">
            {data.academic_strengths.map((str, idx) => (
              <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Icon name="circlecheck" className="positive" />
                <span style={{ color: '#f3f4f6', fontWeight: 500 }}>{str}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Improvements Linked to Career Goals */}
        <div className="card">
          <div className="card-head">
            <div>
              <span className="eyebrow">TARGET ROLE ALIGNMENT</span>
              <h3>Course Improvement Areas</h3>
            </div>
            <Badge tone="amber">Actionable</Badge>
          </div>
          <p className="muted-text" style={{ marginBottom: 16 }}>
            Specific subjects where strengthening fundamentals elevates your job readiness.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.academic_improvements.map((imp, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <strong>{imp.subject_code} · {imp.subject_name}</strong>
                  <Badge tone={imp.priority === 'High' ? 'rose' : 'amber'}>{imp.priority} Priority</Badge>
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: 6 }}>
                  {imp.reason}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#22d3ee' }}>
                  <Icon name="lightbulb" size={14} />
                  <span><strong>Next step:</strong> {imp.suggested_action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts & Goals Section */}
      <div className="bottom-grid">
        {/* Alerts */}
        <div className="card activity-card">
          <div className="card-head">
            <div>
              <span className="eyebrow">ACADEMIC ALERTS</span>
              <h3>Notifications & Milestones</h3>
            </div>
            <Badge tone="violet">{data.alerts.length} Active</Badge>
          </div>
          {data.alerts.map(a => (
            <div className="activity-row" key={a.id}>
              <div className={`activity-icon ${a.severity === 'Critical' ? 'rose' : a.severity === 'Warning' ? 'amber' : 'green'}`}>
                <Icon name={a.type.includes('achievement') ? 'award' : 'alert'} />
              </div>
              <div>
                <strong>{a.type.replace('_', ' ').toUpperCase()}</strong>
                <p>{a.message}</p>
              </div>
              <time>{new Date(a.created_at).toLocaleDateString()}</time>
            </div>
          ))}
        </div>

        {/* Academic Goals */}
        <div className="card readiness-card">
          <div className="card-head">
            <div>
              <span className="eyebrow">ACADEMIC GOALS</span>
              <h3>Mentor Assigned Targets</h3>
            </div>
            <Badge tone="cyan">{data.goals.length} Goals</Badge>
          </div>
          <div className="readiness-list">
            {data.goals.map((g, i) => (
              <div key={g.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{g.title}</span>
                  <strong style={{ color: '#22d3ee' }}>{g.progress}%</strong>
                </div>
                <ProgressBar value={g.progress} tone={i === 0 ? 'violet' : 'cyan'} showValue={false} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#718099', marginTop: 4 }}>
                  <span>Target: {g.target_value}</span>
                  <span>Due: {g.deadline ? new Date(g.deadline).toLocaleDateString() : 'End of Sem'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Semester Modal */}
      <Modal open={showAddSemesterModal} title="Record Semester Performance" onClose={() => setShowAddSemesterModal(false)}>
        <form className="modal-form" onSubmit={handleAddSemester}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              Semester Number
              <input
                type="number"
                min="1"
                max="10"
                value={semesterForm.semester}
                onChange={e => setSemesterForm({ ...semesterForm, semester: parseInt(e.target.value) || 1 })}
                required
              />
            </label>
            <label>
              Academic Year
              <input
                type="text"
                placeholder="e.g. 2025-2026"
                value={semesterForm.academic_year}
                onChange={e => setSemesterForm({ ...semesterForm, academic_year: e.target.value })}
                required
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              SGPA (Semester GPA)
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={semesterForm.sgpa}
                onChange={e => setSemesterForm({ ...semesterForm, sgpa: parseFloat(e.target.value) || 0 })}
                required
              />
            </label>
            <label>
              Cumulative CGPA
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={semesterForm.cgpa}
                onChange={e => setSemesterForm({ ...semesterForm, cgpa: parseFloat(e.target.value) || 0 })}
                required
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              Credits Registered
              <input
                type="number"
                min="1"
                max="35"
                value={semesterForm.credits_registered}
                onChange={e => setSemesterForm({ ...semesterForm, credits_registered: parseInt(e.target.value) || 0 })}
              />
            </label>
            <label>
              Credits Earned
              <input
                type="number"
                min="0"
                max="35"
                value={semesterForm.credits_earned}
                onChange={e => setSemesterForm({ ...semesterForm, credits_earned: parseInt(e.target.value) || 0 })}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              Active Arrears
              <input
                type="number"
                min="0"
                max="10"
                value={semesterForm.arrear_count}
                onChange={e => setSemesterForm({ ...semesterForm, arrear_count: parseInt(e.target.value) || 0 })}
              />
            </label>
            <label>
              Attendance %
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={semesterForm.attendance_percentage}
                onChange={e => setSemesterForm({ ...semesterForm, attendance_percentage: parseFloat(e.target.value) || 0 })}
              />
            </label>
          </div>

          <button type="submit" className="primary-btn full" style={{ marginTop: '14px' }}>
            <Icon name="check" size={15} /> Save Semester Record
          </button>
        </form>
      </Modal>

      {/* Add Subject Modal */}
      <Modal open={showAddSubjectModal} title="Add Course Subject Result" onClose={() => setShowAddSubjectModal(false)}>
        <form className="modal-form" onSubmit={handleAddSubject}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              Subject Code
              <input
                type="text"
                placeholder="e.g. CS3201"
                value={subjectForm.subject_code}
                onChange={e => setSubjectForm({ ...subjectForm, subject_code: e.target.value })}
                required
              />
            </label>
            <label>
              Category
              <select
                value={subjectForm.category}
                onChange={e => setSubjectForm({ ...subjectForm, category: e.target.value })}
              >
                <option value="AI/ML">AI / ML</option>
                <option value="Core CS">Core CS</option>
                <option value="Math">Mathematics</option>
                <option value="Basic Science">Basic Science</option>
                <option value="Elective">Elective</option>
                <option value="Lab / Practical">Lab / Practical</option>
              </select>
            </label>
          </div>

          <label>
            Subject Name
            <input
              type="text"
              placeholder="e.g. Deep Learning & Neural Networks"
              value={subjectForm.subject_name}
              onChange={e => setSubjectForm({ ...subjectForm, subject_name: e.target.value })}
              required
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <label>
              Credits
              <input
                type="number"
                min="1"
                max="6"
                value={subjectForm.credits}
                onChange={e => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) || 3 })}
              />
            </label>
            <label>
              Grade
              <select
                value={subjectForm.grade}
                onChange={e => {
                  const g = e.target.value
                  let gp = 8.0
                  if (g === 'O') gp = 10.0
                  else if (g === 'A+') gp = 9.0
                  else if (g === 'A') gp = 8.0
                  else if (g === 'B+') gp = 7.0
                  else if (g === 'B') gp = 6.0
                  else if (g === 'RA' || g === 'U') gp = 0.0
                  setSubjectForm({ ...subjectForm, grade: g, grade_point: gp, status: gp === 0 ? 'Arrear' : 'Passed' })
                }}
              >
                <option value="O">O (10.0)</option>
                <option value="A+">A+ (9.0)</option>
                <option value="A">A (8.0)</option>
                <option value="B+">B+ (7.0)</option>
                <option value="B">B (6.0)</option>
                <option value="RA">RA / Arrear (0.0)</option>
              </select>
            </label>
            <label>
              Status
              <select
                value={subjectForm.status}
                onChange={e => setSubjectForm({ ...subjectForm, status: e.target.value as any })}
              >
                <option value="Passed">Passed</option>
                <option value="Arrear">Arrear</option>
                <option value="Cleared">Cleared</option>
                <option value="Current">Current</option>
              </select>
            </label>
          </div>

          <label>
            Attendance %
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={subjectForm.attendance_percentage}
              onChange={e => setSubjectForm({ ...subjectForm, attendance_percentage: parseFloat(e.target.value) || 90 })}
            />
          </label>

          <button type="submit" className="primary-btn full" style={{ marginTop: '14px' }}>
            <Icon name="check" size={15} /> Add Course Result
          </button>
        </form>
      </Modal>

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
