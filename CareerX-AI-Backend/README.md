
# CareerX AI — Full-Stack Prototype

CareerX AI is an AI-assisted student career intelligence platform for PS51-style career path and job role recommendation.

## What is included

### Student
- Career recommendations with explainable match factors
- Skill gaps and job readiness
- Trust / evidence status
- Certificate recommendations
- Project recommendations
- What-if simulation
- AI Career Coach endpoint
- Feedback

### Mentor
- Mentor dashboard
- 10 assigned students in demo seed
- Progress overview
- Student detail view
- Skill gaps
- Certificate recommendations
- Project recommendations
- Alerts
- Mentor notes
- Mentor goals
- Review / approve / modify AI recommendations

### Admin
- Institution overview
- Mentor workload
- User management
- Student → mentor assignment
- Audit log

## Run locally

1. Create a Python 3.11+ virtual environment.

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env`.

4. Start API:

```bash
python run.py
```

5. Open:
- API docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/health

Demo users:
- Student: `student@careerx.ai` / `demo123`
- Mentor: `mentor@careerx.ai` / `demo123`
- Admin: `admin@careerx.ai` / `demo123`

## Supabase

The backend uses SQLAlchemy. For a Supabase Postgres deployment, set `DATABASE_URL` to the Postgres connection string from the Supabase dashboard.

The frontend should never receive a Supabase secret key. Supabase Auth/Data APIs use JWT and RLS; server-side secret keys must stay on the trusted backend. See Supabase documentation for current connection and Auth guidance.

## AI implementation

- Career matching: weighted skill/interest/academic/project model + cosine similarity
- Semantic role similarity: TF-IDF cosine similarity
- Readiness: deterministic weighted model designed to be replaceable by a trained XGBoost model
- Profile anomaly detection: IsolationForest
- Certificate/project recommendations: skill-gap rule engine
- Coach: deterministic contextual coach; optional OpenAI integration can be added behind `OPENAI_API_KEY`

This is a hackathon-ready decision-support prototype, not a production hiring predictor.
