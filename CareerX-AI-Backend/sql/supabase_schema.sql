
-- CareerX AI Supabase / PostgreSQL schema
-- For the complete local prototype, the same tables are created by SQLAlchemy.

create table if not exists public.users (
  id bigserial primary key,
  email text unique not null,
  full_name text not null,
  password_hash text not null,
  role text not null default 'student',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.student_profiles (
  id bigserial primary key,
  user_id bigint unique not null references public.users(id) on delete cascade,
  department text not null default 'Artificial Intelligence and Data Science',
  graduation_year integer not null default 2027,
  cgpa numeric not null default 8.7,
  target_role text not null default 'AI / ML Engineer',
  interests jsonb not null default '[]'::jsonb,
  readiness_score numeric not null default 78,
  trust_score numeric not null default 91,
  roadmap_progress numeric not null default 46,
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id bigserial primary key,
  name text unique not null,
  category text not null default 'General'
);

create table if not exists public.student_skills (
  id bigserial primary key,
  student_id bigint not null references public.student_profiles(id) on delete cascade,
  skill_id bigint not null references public.skills(id) on delete cascade,
  level numeric not null default 50,
  evidence text not null default 'Self reported'
);

create table if not exists public.certifications (
  id bigserial primary key,
  student_id bigint not null references public.student_profiles(id) on delete cascade,
  name text not null,
  issuer text,
  status text not null default 'Self reported',
  verification_url text,
  completed_on date
);

create table if not exists public.projects (
  id bigserial primary key,
  student_id bigint not null references public.student_profiles(id) on delete cascade,
  title text not null,
  description text,
  skills jsonb not null default '[]'::jsonb,
  evidence_url text,
  status text not null default 'Project evidence',
  impact text
);

create table if not exists public.mentor_assignments (
  id bigserial primary key,
  mentor_id bigint not null references public.users(id) on delete cascade,
  student_id bigint not null references public.student_profiles(id) on delete cascade,
  status text not null default 'active',
  assigned_at timestamptz not null default now()
);

create table if not exists public.mentor_notes (
  id bigserial primary key,
  mentor_id bigint not null references public.users(id) on delete cascade,
  student_id bigint not null references public.student_profiles(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.mentor_goals (
  id bigserial primary key,
  mentor_id bigint not null references public.users(id) on delete cascade,
  student_id bigint not null references public.student_profiles(id) on delete cascade,
  title text not null,
  progress numeric not null default 0,
  due_date date,
  status text not null default 'active'
);

create table if not exists public.mentor_alerts (
  id bigserial primary key,
  mentor_id bigint not null references public.users(id) on delete cascade,
  student_id bigint not null references public.student_profiles(id) on delete cascade,
  severity text not null default 'medium',
  title text not null,
  message text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.mentor_reviews (
  id bigserial primary key,
  mentor_id bigint not null references public.users(id) on delete cascade,
  student_id bigint not null references public.student_profiles(id) on delete cascade,
  recommendation text not null,
  decision text not null default 'Pending',
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigserial primary key,
  actor_user_id bigint not null references public.users(id),
  actor_role text not null,
  action text not null,
  module text not null,
  status text not null default 'Success',
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.academic_records (
  id bigserial primary key,
  student_id bigint not null references public.student_profiles(id) on delete cascade,
  semester integer not null check (semester >= 1 and semester <= 12),
  academic_year text not null default '2024-2025',
  sgpa numeric(4,2) not null check (sgpa >= 0 and sgpa <= 10),
  cgpa numeric(4,2) not null check (cgpa >= 0 and cgpa <= 10),
  arrear_count integer not null default 0 check (arrear_count >= 0),
  cleared_arrear_count integer not null default 0 check (cleared_arrear_count >= 0),
  credits_registered numeric(5,1) not null default 24.0 check (credits_registered >= 0),
  credits_earned numeric(5,1) not null default 24.0 check (credits_earned >= 0),
  attendance_percentage numeric(5,2) not null default 85.0 check (attendance_percentage >= 0 and attendance_percentage <= 100),
  academic_progress_score numeric(5,2) not null default 80.0 check (academic_progress_score >= 0 and academic_progress_score <= 100),
  trend text not null default 'Stable',
  source text not null default 'institution_import',
  verification_status text not null default 'Verified',
  created_by bigint references public.users(id) on delete set null,
  updated_by bigint references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_academic_records_student_sem on public.academic_records(student_id, semester);

create table if not exists public.subject_results (
  id bigserial primary key,
  academic_record_id bigint not null references public.academic_records(id) on delete cascade,
  subject_code text not null,
  subject_name text not null,
  credits numeric(4,1) not null default 3.0 check (credits >= 0),
  grade text not null default 'A',
  grade_point numeric(4,2) not null default 8.0 check (grade_point >= 0 and grade_point <= 10),
  status text not null default 'Passed',
  category text not null default 'General',
  attendance_percentage numeric(5,2) not null default 85.0 check (attendance_percentage >= 0 and attendance_percentage <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subject_results_record on public.subject_results(academic_record_id);

create table if not exists public.academic_alerts (
  id bigserial primary key,
  student_id bigint not null references public.student_profiles(id) on delete cascade,
  type text not null,
  severity text not null default 'Warning',
  message text not null,
  status text not null default 'Active',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by bigint references public.users(id) on delete set null
);

create index if not exists idx_academic_alerts_student on public.academic_alerts(student_id);

create table if not exists public.academic_goals (
  id bigserial primary key,
  student_id bigint not null references public.student_profiles(id) on delete cascade,
  mentor_id bigint not null references public.users(id) on delete cascade,
  title text not null,
  description text default '',
  target_value text default '',
  deadline date,
  priority text not null default 'Medium',
  progress numeric(5,2) not null default 0 check (progress >= 0 and progress <= 100),
  status text not null default 'In Progress',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_academic_goals_student on public.academic_goals(student_id);

create table if not exists public.institution_configs (
  id bigserial primary key,
  grading_scale numeric(4,2) not null default 10.0,
  minimum_attendance numeric(5,2) not null default 75.0,
  total_credits_required numeric(6,1) not null default 160.0,
  weights_json jsonb not null default '{"cgpa_performance": 0.30, "sgpa_trend": 0.20, "arrear_status": 0.20, "credit_completion": 0.10, "attendance": 0.10, "subject_performance": 0.10}'::jsonb,
  rules_json jsonb not null default '{"needs_attention_cgpa": 6.5, "needs_attention_attendance": 75.0, "needs_attention_arrears": 1}'::jsonb,
  updated_at timestamptz not null default now()
);
