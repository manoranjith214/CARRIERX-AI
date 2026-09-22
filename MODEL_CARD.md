
# CareerX AI — Model Card (Hackathon Prototype)

## 1. Career recommendation engine
Inputs:
- Student skills + proficiency
- Interest signals
- Academic score
- Project evidence

Current scoring:
- 50% skill alignment
- 20% interest alignment
- 15% academic alignment
- 15% project alignment

The implementation exposes the components separately so the scoring can be replaced by a learned ranker later.

## 2. Semantic similarity
Current prototype:
- TF-IDF vectorization + cosine similarity for role-description matching.

Planned upgrade:
- Sentence Transformers embeddings when semantic model hosting is available.

## 3. Readiness
Current prototype:
- Weighted readiness model for technical, project, academic, certification and communication signals.

Production upgrade:
- Train and validate an XGBoost model with real placement/outcome data.
- Track calibration, drift and subgroup performance.

## 4. Anomaly detection
Current prototype:
- IsolationForest on a profile feature vector.

Interpretation:
- Anomaly means "unusual pattern", not "fraud".
- Review and additional evidence are required before making factual claims.

## 5. Explainability
Current prototype:
- Component-level reason strings and feature contributions.

Production upgrade:
- SHAP explanations for a trained tree-based model.
- Store explanation snapshots so mentors can audit recommendation changes.

## 6. Certificate / project recommendations
Current prototype:
- Rule/ranking layer driven by target-role skill gaps.

Production upgrade:
- Add quality, cost, duration, provider, completion rate and historical outcome signals.

## 7. AI Coach
Current demo:
- Context-aware deterministic fallback.

Production:
- Ground an LLM on verified profile context, recommendation explanations, mentor notes and roadmap state.
- Never let the LLM invent student achievements or evidence.
