# CareerX AI Frontend

Production-style React + TypeScript frontend for the CareerX AI full-stack hackathon prototype.

## Stack

- React + TypeScript + Vite
- React Router
- Tailwind CSS + custom design system
- Recharts
- Framer Motion
- Lucide React
- FastAPI-ready API client

## Role experiences

### Student
- Dashboard
- 360° profile
- Skills / interests
- Resume / evidence
- Trust center
- Career matches
- Career explanation
- Skill gaps
- Job readiness
- Roadmap
- Project Lab
- What-if Simulator
- AI Career Coach
- Mentor Review
- Progress
- Feedback
- Responsible AI
- Settings

### Mentor
- Mentor Hub
- 10-student portfolio view
- Student progress detail
- Longitudinal readiness / roadmap
- Skill gaps
- AI certificate recommendations
- AI project recommendations
- Mentor notes
- Mentor goals
- AI recommendation review / approval / modification

### Admin
- Institution overview
- Mentor capacity
- Student → mentor assignment
- User management
- Audit log

## Run

```bash
npm install
npm run dev
```

Optional API URL:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

The frontend falls back to the existing polished mock/demo screens where live API wiring is not needed for the demonstration. The Mentor and Admin portals are backed by the FastAPI demo API.
