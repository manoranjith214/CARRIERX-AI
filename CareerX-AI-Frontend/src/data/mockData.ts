export type NavItem = { label: string; path: string; icon: string; section?: string }

export const skills = [
  { name: 'Python', level: 92, category: 'AI / Data', evidence: 'Assessed' },
  { name: 'C++', level: 88, category: 'Programming', evidence: 'Verified' },
  { name: 'SQL', level: 76, category: 'Data', evidence: 'Project' },
  { name: 'Machine Learning', level: 71, category: 'AI / Data', evidence: 'Project' },
  { name: 'React', level: 68, category: 'Web', evidence: 'Self reported' },
  { name: 'Java', level: 64, category: 'Programming', evidence: 'Academic' },
  { name: 'Docker', level: 32, category: 'Cloud / DevOps', evidence: 'Needs review' },
  { name: 'AWS', level: 27, category: 'Cloud / DevOps', evidence: 'Self reported' },
]

export const careers = [
  { name: 'AI / ML Engineer', match: 92, confidence: 90, color: 'violet', skills: 91, interest: 96, academics: 87, projects: 92, market: 'High', gap: 6, desc: 'Build and deploy intelligent systems using machine learning, deep learning and production APIs.' },
  { name: 'Data Scientist', match: 89, confidence: 88, color: 'cyan', skills: 88, interest: 94, academics: 90, projects: 82, market: 'High', gap: 5, desc: 'Turn data into decisions through statistics, experimentation, machine learning and storytelling.' },
  { name: 'Data Engineer', match: 84, confidence: 83, color: 'blue', skills: 79, interest: 85, academics: 82, projects: 86, market: 'High', gap: 7, desc: 'Build reliable data platforms, pipelines and systems that power analytics and AI.' },
  { name: 'Software Engineer', match: 79, confidence: 84, color: 'emerald', skills: 81, interest: 72, academics: 86, projects: 79, market: 'High', gap: 8, desc: 'Design, build, test and maintain scalable software products across web and backend systems.' },
  { name: 'Product Analyst', match: 75, confidence: 78, color: 'amber', skills: 73, interest: 76, academics: 81, projects: 66, market: 'Medium', gap: 9, desc: 'Connect product data with customer behavior, experiments and business outcomes.' },
]

export const readiness = [
  { name: 'Technical', value: 82 },
  { name: 'Academic', value: 88 },
  { name: 'Projects', value: 71 },
  { name: 'Interview', value: 64 },
  { name: 'Resume', value: 86 },
  { name: 'Communication', value: 74 },
]

export const careerTrend = [
  { month: 'May', match: 72, readiness: 51 },
  { month: 'Jun', match: 78, readiness: 59 },
  { month: 'Jul', match: 84, readiness: 66 },
  { month: 'Aug', match: 88, readiness: 73 },
  { month: 'Sep', match: 92, readiness: 78 },
]

export const skillGrowth = [
  { month: 'May', python: 72, sql: 54, ml: 42, cloud: 18 },
  { month: 'Jun', python: 78, sql: 61, ml: 49, cloud: 21 },
  { month: 'Jul', python: 83, sql: 68, ml: 57, cloud: 23 },
  { month: 'Aug', python: 88, sql: 72, ml: 65, cloud: 27 },
  { month: 'Sep', python: 92, sql: 76, ml: 71, cloud: 32 },
]

export const roadmap = [
  { phase: '01', title: 'Foundation', status: 'completed', effort: '3 weeks', items: ['Python', 'Statistics', 'SQL'] },
  { phase: '02', title: 'Machine Learning', status: 'in-progress', effort: '5 weeks', items: ['Scikit-learn', 'Model evaluation', 'Feature engineering'] },
  { phase: '03', title: 'Deep Learning', status: 'next', effort: '6 weeks', items: ['PyTorch', 'Computer Vision', 'NLP'] },
  { phase: '04', title: 'MLOps', status: 'locked', effort: '4 weeks', items: ['Docker', 'FastAPI', 'Cloud deployment'] },
  { phase: '05', title: 'Career Launch', status: 'locked', effort: '3 weeks', items: ['Portfolio', 'Interview prep', 'Applications'] },
]

export const projects = [
  { title: 'AI Resume Analyzer', difficulty: 'Intermediate', time: '2–3 weeks', impact: '+12% AI profile', tags: ['Python', 'NLP', 'FastAPI'], reason: 'Strengthens NLP and API delivery, two current gaps for your target role.' },
  { title: 'Visual Defect Detector', difficulty: 'Advanced', time: '4–5 weeks', impact: '+15% ML profile', tags: ['PyTorch', 'Computer Vision', 'Docker'], reason: 'Closes the deep learning and deployment gap with demonstrable evidence.' },
  { title: 'Career Match Engine', difficulty: 'Intermediate', time: '2 weeks', impact: '+9% data profile', tags: ['Embeddings', 'Ranking', 'PostgreSQL'], reason: 'Turns your current CareerX work into a portfolio-ready recommender project.' },
]

export const notifications = [
  { title: 'Profile verification complete', text: '4 evidence items moved to verified.', time: '8m ago', type: 'success' },
  { title: 'New career match generated', text: 'AI / ML Engineer remains your strongest match.', time: '1h ago', type: 'info' },
  { title: 'Mentor requested evidence', text: 'Add a demo link for your ML project.', time: '3h ago', type: 'warning' },
]
