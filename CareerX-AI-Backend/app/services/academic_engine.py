from typing import Any
from ..models import AcademicRecord, SubjectResult, AcademicAlert, InstitutionConfig, StudentProfile

# Mapping of career roles to academic core subject areas
CAREER_ACADEMIC_AREAS = {
    "AI / ML Engineer": {
        "required_areas": ["Mathematics", "Statistics", "Programming", "Data Structures", "Machine Learning"],
        "core_keywords": ["math", "calculus", "linear algebra", "probability", "statistics", "python", "data structures", "algorithms", "machine learning", "artificial intelligence"]
    },
    "Data Scientist": {
        "required_areas": ["Statistics", "Mathematics", "Database Systems", "Programming", "Machine Learning"],
        "core_keywords": ["statistics", "probability", "data analysis", "database", "sql", "python", "machine learning", "data mining"]
    },
    "Data Engineer": {
        "required_areas": ["Database Systems", "Data Structures", "Operating Systems", "Programming", "Cloud Computing"],
        "core_keywords": ["database", "dbms", "sql", "data structures", "distributed systems", "operating systems", "cloud", "python", "java"]
    },
    "Software Engineer": {
        "required_areas": ["Data Structures", "Algorithms", "Object Oriented Programming", "Operating Systems", "Software Engineering"],
        "core_keywords": ["data structures", "algorithms", "c++", "java", "python", "operating systems", "software engineering", "computer networks"]
    },
    "Product Analyst": {
        "required_areas": ["Statistics", "Database Systems", "Analytics", "Mathematics"],
        "core_keywords": ["statistics", "business", "database", "analytics", "sql", "excel", "visualization"]
    },
    "Cloud / DevOps Engineer": {
        "required_areas": ["Operating Systems", "Computer Networks", "Cloud Computing", "Systems Programming"],
        "core_keywords": ["operating systems", "linux", "networks", "cloud", "virtualization", "security", "devops"]
    }
}

DEFAULT_WEIGHTS = {
    "cgpa_performance": 0.30,
    "sgpa_trend": 0.20,
    "arrear_status": 0.20,
    "credit_completion": 0.10,
    "attendance": 0.10,
    "subject_performance": 0.10
}

def calculate_academic_trend(records: list[AcademicRecord]) -> str:
    if not records:
        return "Stable"
    sorted_records = sorted(records, key=lambda r: r.semester)
    if len(sorted_records) < 2:
        return "Stable"
    
    last = sorted_records[-1].sgpa
    prev = sorted_records[-2].sgpa
    diff = last - prev
    
    if diff >= 0.15:
        return "Improving"
    elif diff <= -0.15:
        return "Declining"
    return "Stable"

def calculate_academic_progress_score(
    cgpa: float,
    records: list[AcademicRecord],
    subjects: list[SubjectResult],
    config: InstitutionConfig | None = None
) -> float:
    weights = (config.weights_json if config and config.weights_json else DEFAULT_WEIGHTS)
    
    # 1. CGPA Component (scaled 0-100)
    cgpa_scale = config.grading_scale if config else 10.0
    cgpa_norm = min(100.0, max(0.0, (cgpa / cgpa_scale) * 100.0))
    
    # 2. SGPA Trend Component
    sorted_records = sorted(records, key=lambda r: r.semester) if records else []
    if len(sorted_records) >= 2:
        delta = sorted_records[-1].sgpa - sorted_records[-2].sgpa
        trend_score = min(100.0, max(40.0, 75.0 + (delta * 25.0)))
    elif sorted_records:
        trend_score = min(100.0, max(40.0, (sorted_records[0].sgpa / cgpa_scale) * 100.0))
    else:
        trend_score = cgpa_norm
    
    # 3. Arrear Status Component (0 arrears = 100%, -25 per active arrear)
    active_arrears = sum(r.arrear_count for r in sorted_records[-1:]) if sorted_records else 0
    arrear_score = max(0.0, 100.0 - (active_arrears * 30.0))
    
    # 4. Credit Completion Component
    total_req = config.total_credits_required if config else 160.0
    total_earned = sum(r.credits_earned for r in sorted_records) if sorted_records else 0.0
    expected_credits = len(sorted_records) * (total_req / 8.0) if sorted_records else 24.0
    credit_score = min(100.0, max(0.0, (total_earned / max(1.0, expected_credits)) * 100.0))
    
    # 5. Attendance Component
    avg_attendance = (sum(r.attendance_percentage for r in sorted_records) / len(sorted_records)) if sorted_records else 85.0
    attendance_score = min(100.0, max(0.0, avg_attendance))
    
    # 6. Subject Performance Average
    if subjects:
        subj_avg = sum(s.grade_point for s in subjects) / len(subjects)
        subj_score = min(100.0, max(0.0, (subj_avg / cgpa_scale) * 100.0))
    else:
        subj_score = cgpa_norm
        
    total_score = (
        (cgpa_norm * weights.get("cgpa_performance", 0.30)) +
        (trend_score * weights.get("sgpa_trend", 0.20)) +
        (arrear_score * weights.get("arrear_status", 0.20)) +
        (credit_score * weights.get("credit_completion", 0.10)) +
        (attendance_score * weights.get("attendance", 0.10)) +
        (subj_score * weights.get("subject_performance", 0.10))
    )
    return round(min(100.0, max(0.0, total_score)), 1)

def extract_academic_strengths(subjects: list[SubjectResult]) -> list[str]:
    category_scores: dict[str, list[float]] = {}
    for s in subjects:
        cat = s.category or "General"
        category_scores.setdefault(cat, []).append(s.grade_point)
    
    strengths = []
    for cat, points in category_scores.items():
        avg = sum(points) / len(points)
        if avg >= 8.0 or any(p >= 9.0 for p in points):
            strengths.append(cat)
            
    # Also add individual standout subjects
    for s in subjects:
        if s.grade_point >= 9.0 and s.subject_name not in strengths:
            if len(strengths) < 5:
                strengths.append(s.subject_name)
                
    if not strengths:
        strengths = ["Programming Fundamentals", "Database Systems", "Mathematics"]
    return strengths[:5]

def extract_academic_improvements(subjects: list[SubjectResult], target_role: str | None = None) -> list[dict[str, Any]]:
    improvements = []
    role_info = CAREER_ACADEMIC_AREAS.get(target_role or "AI / ML Engineer", CAREER_ACADEMIC_AREAS["AI / ML Engineer"])
    
    for s in subjects:
        is_relevant = any(k in s.subject_name.lower() or k in s.category.lower() for k in role_info["core_keywords"])
        is_arrear = s.status == "Arrear" or s.grade_point < 5.0
        is_weak = s.grade_point < 7.0
        
        if is_arrear or (is_relevant and is_weak):
            reason = f"Active arrear requires priority clearance." if is_arrear else f"Relevant academic area for {target_role or 'your target role'} (Grade: {s.grade})."
            action = f"Clear {s.subject_name} backlog with faculty assistance." if is_arrear else f"Review {s.subject_name} core concepts and solve practical assignments."
            improvements.append({
                "subject_code": s.subject_code,
                "subject_name": s.subject_name,
                "current_performance": f"Grade: {s.grade} ({s.grade_point} GP)",
                "status": s.status,
                "reason": reason,
                "suggested_action": action,
                "career_target": target_role or "AI / ML Engineer",
                "priority": "High" if is_arrear else "Medium"
            })
            
    return improvements

def calculate_career_academic_alignment(subjects: list[SubjectResult], cgpa: float, target_career: str) -> tuple[float, dict[str, Any]]:
    role_info = CAREER_ACADEMIC_AREAS.get(target_career, CAREER_ACADEMIC_AREAS.get("AI / ML Engineer"))
    if not role_info or not subjects:
        score = min(100.0, max(50.0, cgpa * 10.0))
        return round(score, 1), {
            "alignment_pct": round(score, 1),
            "matched_areas": [],
            "relevant_subjects": [],
            "arrear_penalty": 0.0,
            "explanation": f"Baseline academic alignment calculated from cumulative CGPA ({cgpa:.2f}/10.0)."
        }
        
    relevant_subjects = []
    relevant_points = []
    arrear_count_rel = 0
    
    for s in subjects:
        if any(k in s.subject_name.lower() or k in s.category.lower() for k in role_info["core_keywords"]):
            relevant_subjects.append(s.subject_name)
            relevant_points.append(s.grade_point)
            if s.status == "Arrear" or s.grade_point < 5.0:
                arrear_count_rel += 1
            
    if relevant_points:
        rel_avg = (sum(relevant_points) / len(relevant_points)) * 10.0
        base = (cgpa * 10.0 * 0.4) + (rel_avg * 0.6)
    else:
        base = cgpa * 10.0
        
    arrear_penalty = arrear_count_rel * 12.0
    alignment = max(35.0, min(99.0, base - arrear_penalty))
    
    explanation_text = (
        f"Strong performance across {len(relevant_subjects)} relevant course(s) including {', '.join(relevant_subjects[:3])}."
        if relevant_subjects and arrear_count_rel == 0
        else (
            f"Coursework evaluated for {target_career}. Active backlog in {arrear_count_rel} relevant course(s) creates a drag on alignment."
            if arrear_count_rel > 0
            else f"Coursework evaluated against core {target_career} academic domains."
        )
    )
    
    return round(alignment, 1), {
        "alignment_pct": round(alignment, 1),
        "matched_areas": role_info["required_areas"],
        "relevant_subjects": relevant_subjects[:5],
        "arrear_penalty": arrear_penalty,
        "explanation": explanation_text
    }

def calculate_unified_gaps(
    skill_gaps: list[dict],
    academic_gaps: list[dict],
    project_count: int,
    cert_count: int,
    target_role: str
) -> list[dict[str, Any]]:
    unified = []
    
    # 1. Technical Skill Gaps
    for sg in skill_gaps:
        curr = sg.get("current", 0)
        tgt = sg.get("target", 80)
        gap_diff = max(0, tgt - curr)
        priority = "High" if gap_diff >= 30 else ("Medium" if gap_diff >= 15 else "Low")
        unified.append({
            "gap_type": "Technical Skill",
            "name": sg.get("skill", "Unknown Skill"),
            "current": curr,
            "target": tgt,
            "priority": priority,
            "reason": f"Current proficiency ({curr}%) is below target role benchmark ({tgt}%).",
            "recommended_action": f"Practice hands-on coding exercises and implement projects in {sg.get('skill')}.",
            "career_impact": f"Essential for technical assessment and production implementation in {target_role}."
        })
        
    # 2. Academic Gaps
    for ag in academic_gaps:
        unified.append({
            "gap_type": "Academic",
            "name": f"{ag.get('subject_code', '')} {ag.get('subject_name', '')}".strip(),
            "current": ag.get("current_performance", "Needs Improvement"),
            "target": "Grade: A / Cleared",
            "priority": ag.get("priority", "High"),
            "reason": ag.get("reason", "Foundational academic coursework requires mastery."),
            "recommended_action": ag.get("suggested_action", "Review concepts with faculty and solve practice problem sets."),
            "career_impact": f"Core theoretical foundation for {target_role} hiring criteria."
        })
        
    # 3. Project Gaps
    if project_count < 2:
        unified.append({
            "gap_type": "Project Evidence",
            "name": "Portfolio Project Artifacts",
            "current": f"{project_count} project(s)",
            "target": "3+ verified projects",
            "priority": "High" if project_count == 0 else "Medium",
            "reason": "Employers require demonstrable evidence of real-world application.",
            "recommended_action": f"Complete an end-to-end portfolio project aligned to {target_role} with GitHub repository and demo.",
            "career_impact": "Directly impacts interview shortlisting and technical evaluation confidence."
        })
        
    # 4. Certification Gaps
    if cert_count < 1:
        unified.append({
            "gap_type": "Certification",
            "name": "Industry Recognized Credential",
            "current": f"{cert_count} credential(s)",
            "target": "1-2 verified credentials",
            "priority": "Medium",
            "reason": "Standardized credential validates core competencies to campus and lateral recruiters.",
            "recommended_action": f"Pursue foundational certification in core {target_role} technologies.",
            "career_impact": "Reinforces trust score and resume validation."
        })
        
    return sorted(unified, key=lambda x: (x["priority"] != "High", x["priority"] != "Medium"))

def generate_academic_alerts(student_id: int, records: list[AcademicRecord], config: InstitutionConfig | None = None) -> list[dict[str, Any]]:
    alerts = []
    min_att = config.minimum_attendance if config else 75.0
    total_req = config.total_credits_required if config else 160.0
    sorted_records = sorted(records, key=lambda r: r.semester)
    
    if sorted_records:
        latest = sorted_records[-1]
        
        # Arrears Alert
        if latest.arrear_count > 0:
            alerts.append({
                "student_id": student_id,
                "type": "Active Arrear",
                "severity": "Warning" if latest.arrear_count == 1 else "Critical",
                "message": f"Active arrear detected: {latest.arrear_count} arrear(s) in Semester {latest.semester}. Focus on upcoming supplementary examinations.",
                "status": "Active"
            })
        elif latest.arrear_count == 0:
            alerts.append({
                "student_id": student_id,
                "type": "No Active Arrears",
                "severity": "Info",
                "message": "No active arrears. Academic record is in good standing.",
                "status": "Active"
            })
            
        # Attendance Alert
        if latest.attendance_percentage < min_att:
            alerts.append({
                "student_id": student_id,
                "type": "Attendance Warning",
                "severity": "Warning" if latest.attendance_percentage >= 65.0 else "Critical",
                "message": f"Attendance below institution threshold: Semester {latest.semester} attendance is at {latest.attendance_percentage:.0f}%, below the required {min_att:.0f}%.",
                "status": "Active"
            })
            
        # SGPA / CGPA Alerts
        if len(sorted_records) >= 2:
            prev = sorted_records[-2]
            if latest.cgpa > prev.cgpa + 0.1:
                alerts.append({
                    "student_id": student_id,
                    "type": "CGPA Improved",
                    "severity": "Info",
                    "message": f"CGPA improved: Overall CGPA increased from {prev.cgpa:.2f} to {latest.cgpa:.2f}.",
                    "status": "Active"
                })
            if latest.sgpa < prev.sgpa - 0.4:
                alerts.append({
                    "student_id": student_id,
                    "type": "Latest SGPA Decreased",
                    "severity": "Warning",
                    "message": f"Latest SGPA decreased: SGPA dropped from {prev.sgpa:.2f} in Sem {prev.semester} to {latest.sgpa:.2f} in Sem {latest.semester}.",
                    "status": "Active"
                })
                
        # Credit Completion Alert
        total_earned = sum(r.credits_earned for r in sorted_records)
        expected_credits = len(sorted_records) * (total_req / 8.0)
        if total_earned < expected_credits - 6.0:
            alerts.append({
                "student_id": student_id,
                "type": "Credit Deficit",
                "severity": "Warning",
                "message": f"Credit completion below expected progress: {total_earned:.0f} credits earned vs {expected_credits:.0f} expected for Semester {latest.semester}.",
                "status": "Active"
            })
            
        # Arrears Cleared Alert
        if latest.cleared_arrear_count > 0:
            alerts.append({
                "student_id": student_id,
                "type": "Arrears Cleared",
                "severity": "Info",
                "message": f"Arrears cleared: {latest.cleared_arrear_count} subject(s) cleared in Semester {latest.semester}.",
                "status": "Active"
            })
            
    return alerts
