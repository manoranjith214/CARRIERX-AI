from math import sqrt
from typing import Any
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .career_data import CAREERS, CERTIFICATIONS, PROJECTS
from .academic_engine import calculate_career_academic_alignment, extract_academic_improvements

def _cosine(a: list[float], b: list[float]) -> float:
    a = np.array(a, dtype=float); b = np.array(b, dtype=float)
    den = np.linalg.norm(a) * np.linalg.norm(b)
    return float(np.dot(a,b)/den) if den else 0.0

def career_recommendations(
    student_skills: dict[str, float],
    interests: list[str],
    cgpa: float,
    project_count: int,
    target_role: str | None = None,
    subjects: list[Any] | None = None,
    academic_score: float | None = None,
    active_arrears: int = 0,
    cert_count: int = 1,
    assessed_skill_count: int = 2
):
    results = []
    interest_text = " ".join(interests).lower()
    for career in CAREERS:
        req = career["required_skills"]
        shared = sorted(set(req) | set(student_skills))
        current = [min(100, float(student_skills.get(s, 0))) for s in shared]
        target = [float(req.get(s, 0)) for s in shared]
        
        # 1. Skill Alignment (35%)
        skill_alignment = max(0, min(100, _cosine(current, target) * 100))
        
        # 2. Academic Alignment (20%)
        academic_explanation = {}
        if subjects:
            academic_alignment, academic_explanation = calculate_career_academic_alignment(subjects, cgpa, career["name"])
        else:
            academic_alignment = min(100, max(40, cgpa / 10 * 100))
            if active_arrears > 0:
                academic_alignment = max(30.0, academic_alignment - (active_arrears * 12.0))
            academic_explanation = {"explanation": f"Baseline alignment calculated from CGPA {cgpa:.2f}."}
            
        # 3. Project Alignment (15%)
        project_alignment = min(100.0, max(30.0, 45.0 + project_count * 15.0 + (10.0 if project_count >= 2 else 0.0)))
        
        # 4. Interest Alignment (15%)
        interest_hits = sum(1 for k in career["interest_keywords"] if k.lower() in interest_text)
        interest_alignment = min(100.0, max(40.0, 50.0 + 25.0 * interest_hits))
        
        # 5. Certification Alignment (8%)
        cert_alignment = min(100.0, max(40.0, 50.0 + cert_count * 20.0))
        
        # 6. Assessment Alignment (7%)
        assessment_alignment = min(100.0, max(40.0, 45.0 + assessed_skill_count * 18.0))
        
        # Optional preference alignment small adjustment (+3% max)
        preference_alignment = 3.0 if target_role and target_role == career["name"] else 0.0
        
        # Six-Signal Architecture (35% Skills, 20% Academic, 15% Projects, 15% Interests, 8% Certifications, 7% Assessments)
        raw_match = (
            0.35 * skill_alignment +
            0.20 * academic_alignment +
            0.15 * project_alignment +
            0.15 * interest_alignment +
            0.08 * cert_alignment +
            0.07 * assessment_alignment +
            preference_alignment
        )
        match = round(min(99.0, max(25.0, raw_match)), 1)
        confidence = round(min(98.0, max(50.0, 55.0 + 0.20 * skill_alignment + 0.12 * project_alignment + 0.10 * academic_alignment)), 1)
        
        # Identify Skill Gaps
        skill_gaps = [
            {"skill": s, "current": round(student_skills.get(s, 0)), "target": need, "gap": round(max(0, need - student_skills.get(s, 0)))}
            for s, need in req.items()
            if student_skills.get(s, 0) < need
        ]
        
        # Identify Academic Gaps
        academic_gaps = []
        if subjects:
            academic_gaps = extract_academic_improvements(subjects, career["name"])
            
        # Unified Gaps (Technical, Academic, Projects, Certifications)
        unified_gaps = calculate_unified_gaps(skill_gaps, academic_gaps, project_count, cert_count, career["name"])
        
        # Standout Academic Strengths
        relevant_academic_strengths = []
        if subjects:
            for sub in subjects:
                if any(k in sub.subject_name.lower() or k in sub.category.lower() for k in career.get("interest_keywords", [])):
                    if sub.grade_point >= 8.0:
                        relevant_academic_strengths.append(f"{sub.subject_name} ({sub.grade} Grade)")
                        
        explanation = {
            "why": [
                f"{skill_alignment:.0f}% skill alignment across core competencies required for {career['name']}.",
                f"{academic_alignment:.0f}% academic alignment in foundational coursework and university results.",
                f"{project_alignment:.0f}% project evidence alignment across {project_count} submitted portfolio artifact(s).",
                f"{interest_alignment:.0f}% interest alignment with {interest_hits} keyword match(es).",
                f"{cert_alignment:.0f}% certification alignment ({cert_count} credential(s) tracked).",
                f"{assessment_alignment:.0f}% verified assessment alignment ({assessed_skill_count} benchmark assessment(s))."
            ],
            "strengths": sorted(
                [{"skill": s, "level": round(student_skills.get(s, 0)), "target": need}
                 for s, need in req.items() if student_skills.get(s, 0) >= need],
                key=lambda x: x["level"], reverse=True
            )[:4],
            "relevant_academic_strengths": relevant_academic_strengths[:4],
            "academic_gaps": academic_gaps[:3],
            "skill_gaps": skill_gaps[:6],
            "gaps": skill_gaps[:6],
            "unified_gaps": unified_gaps[:8],
            "academic_alignment_detail": academic_explanation,
            "contrastive": f"Compared with adjacent career pathways, this role demonstrates your strongest academic readiness in relevant coursework combined with your stated target role preference." if preference_alignment else f"Compared with adjacent career options, this pathway leverages your verified academic performance and technical coursework preparation."
        }
        
        results.append({
            "career": career["name"],
            "match_score": match,
            "confidence": confidence,
            "skill_alignment": round(skill_alignment, 1),
            "academic_alignment": round(academic_alignment, 1),
            "project_alignment": round(project_alignment, 1),
            "interest_alignment": round(interest_alignment, 1),
            "certification_alignment": round(cert_alignment, 1),
            "assessment_alignment": round(assessment_alignment, 1),
            "market_signal": career["market_signal"],
            "gap_count": len(skill_gaps),
            "explanation": explanation
        })
    return sorted(results, key=lambda x: x["match_score"], reverse=True)

def semantic_role_similarity(student_text: str):
    corpus = [student_text] + [c["description"] + " " + " ".join(c["required_skills"]) for c in CAREERS]
    matrix = TfidfVectorizer(stop_words="english").fit_transform(corpus)
    scores = cosine_similarity(matrix[0:1], matrix[1:]).flatten()
    return {CAREERS[i]["name"]: round(float(scores[i])*100, 1) for i in range(len(CAREERS))}

def readiness_score(
    skill_mean: float,
    project_count: int,
    cgpa: float,
    certification_count: int,
    communication: float = 70.0,
    academic_score: float | None = None,
    active_arrears: int = 0
):
    """
    Job Readiness Index Formula:
    - Technical Readiness (Skills): 30%
    - Academic Readiness (Progress score or CGPA & arrear penalty): 25%
    - Project Readiness (Portfolio artifacts): 20%
    - Resume & Certification Readiness: 10%
    - Communication & Interview Readiness: 15%
    Notice: Reflects student developmental progress, not a guaranteed prediction of hiring.
    """
    technical = skill_mean
    project_readiness = min(100.0, max(30.0, 45.0 + project_count * 14.0))
    
    if academic_score is not None:
        academic_readiness = academic_score
    else:
        academic_readiness = min(100.0, max(35.0, cgpa * 10.0 - (active_arrears * 15.0)))
        
    cert_readiness = min(100.0, max(35.0, 45.0 + certification_count * 18.0))
    overall = round(
        0.30 * technical +
        0.25 * academic_readiness +
        0.20 * project_readiness +
        0.10 * cert_readiness +
        0.15 * communication,
        1
    )
    return overall

def anomaly_score(profile_vector: list[float]):
    if len(profile_vector) < 4:
        return {"is_anomaly": False, "score": 0.0}
    model = IsolationForest(contamination=0.1, random_state=42)
    x = np.array(profile_vector, dtype=float).reshape(1, -1)
    baseline = np.array([
        [72, 2, 3, 8.2, 65], [80, 3, 4, 8.7, 75], [64, 1, 2, 7.8, 60],
        [88, 4, 5, 9.0, 82], [55, 1, 1, 7.2, 52], [76, 2, 3, 8.5, 70],
        [92, 5, 6, 9.2, 86], [68, 2, 2, 8.0, 64], [83, 3, 4, 8.9, 79]
    ])
    samples = np.vstack([baseline, x])
    model.fit(samples)
    pred = int(model.predict(samples[-1:])[0])
    raw = float(model.decision_function(samples[-1:])[0])
    return {"is_anomaly": pred == -1, "score": round(max(0.0, min(1.0, 0.5-raw)), 3)}

def certificate_recommendations(target_role: str, gaps: list[str]):
    ranked = []
    for cert in CERTIFICATIONS:
        covered = [s for s in cert["skills"] if s in gaps]
        if not covered:
            continue
        priority = "High" if len(covered) >= 2 else "Medium"
        ranked.append({
            "name": cert["name"], "issuer": cert["issuer"], "priority": priority,
            "reason": f"Targets {', '.join(covered)} for your {target_role} pathway.",
            "skills": covered, "estimated_effort": cert["effort"]
        })
    return sorted(ranked, key=lambda x: (x["priority"] != "High", -len(x["skills"])))

def project_recommendations(target_role: str, gaps: list[str]):
    out=[]
    for p in PROJECTS:
        covered=[s for s in p["skills"] if s in gaps]
        if covered:
            out.append({
                **p,
                "reason": f"Closes {', '.join(covered)} while generating portfolio evidence for {target_role}."
            })
    return sorted(out, key=lambda x: -len([s for s in x["skills"] if s in gaps]))

def coach_answer(message: str, context: dict[str, Any]):
    q = message.lower()
    target = context.get("target_role", "your target role")
    gaps = context.get("top_gaps", [])
    match = context.get("match", 0)
    cgpa = context.get("cgpa", 8.4)
    sgpa = context.get("latest_sgpa", 8.7)
    arrears = context.get("arrears", 0)
    cleared_arrears = context.get("cleared_arrears", 0)
    attendance = context.get("attendance", 85.0)
    credits_earned = context.get("credits_earned", 110.0)
    academic_trend = context.get("academic_trend", "Stable")
    academic_strengths = context.get("academic_strengths", ["Mathematics", "Programming"])
    alerts = context.get("alerts", [])
    
    if "academic" in q or "cgpa" in q or "sgpa" in q or "arrear" in q or "grade" in q or "attendance" in q or "credit" in q:
        arrear_text = f"Keep your focus on clearing your {arrears} active arrear(s) to remove backlog risk." if arrears > 0 else f"You have zero active arrears ({cleared_arrears} cleared previously), maintaining a clean academic slate."
        att_text = f"Your attendance is currently {attendance:.1f}%."
        credit_text = f"You have accumulated {credits_earned:.0f} academic credits."
        alert_note = f" Note: {alerts[0]}." if alerts else ""
        return (
            f"Your verified academic record shows CGPA {cgpa:.2f} (Latest SGPA: {sgpa:.2f}, trend: {academic_trend}). "
            f"{att_text} {credit_text} {arrear_text}{alert_note} "
            f"Key academic subject strengths: {', '.join(academic_strengths[:3])}. This provides foundational preparation for {target}."
        )
        
    if "certificate" in q:
        return f"For {target}, start with the highest-priority certificate that closes {gaps[0] if gaps else 'a core gap'}. CareerX evaluates both effort and skill impact relative to your coursework."
        
    if "learn" in q or "next" in q or "internship" in q:
        academic_note = f" Your strong academic foundation in {academic_strengths[0]} is a major asset." if academic_strengths else ""
        return (
            f"Prioritize closing {gaps[0] if gaps else 'your top technical gap'}, then build a portfolio artifact demonstrating end-to-end implementation.{academic_note} "
            f"Your current {target} career match is {match}% with CGPA {cgpa:.2f}."
        )
        
    if "why" in q:
        return (
            f"{target} leads your matches ({match}%) because your technical skills, interest profile, and academic coursework "
            f"in {', '.join(academic_strengths[:2]) if academic_strengths else 'core subjects'} align with industry expectations. "
            f"Closing {', '.join(gaps[:2]) if gaps else 'any remaining gaps'} will maximize your placement readiness."
        )
        
    if "mentor" in q:
        return "Your faculty mentor can review your academic progress, validate semester milestones, set arrear clearance goals, and approve customized certificate pathways."
        
    return (
        f"CareerX evaluates your profile across verified academics (CGPA: {cgpa:.2f}, trend: {academic_trend}, attendance: {attendance:.1f}%), technical skills, and project evidence. "
        f"For {target} ({match}% match), continue strengthening practical skills while maintaining strong semester performance."
    )
