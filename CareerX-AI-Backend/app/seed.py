from datetime import date, timedelta
from sqlalchemy.orm import Session
from .db import Base, engine, SessionLocal
from .models import (
    User, StudentProfile, Skill, StudentSkill, Certification, Project,
    MentorAssignment, MentorAlert, MentorGoal, MentorReview, AuditLog, CareerRole,
    AcademicRecord, SubjectResult, AcademicAlert, AcademicGoal, InstitutionConfig
)
from .security import hash_password
from .services.career_data import CAREERS

SKILLS = [
    ("Python","AI / Data"),("C++","Programming"),("SQL","Data"),("Machine Learning","AI / Data"),
    ("React","Web"),("Java","Programming"),("Docker","Cloud / DevOps"),("AWS","Cloud / DevOps"),
    ("Deep Learning","AI / Data"),("Statistics","AI / Data"),("Power BI","Data"),("Linux","Systems"),("Spark","Data")
]

STUDENT_NAMES = [
    "Jayaseelan G","Ananya R","Arun K","Priya S","Madhan R","Keerthi V","Naveen P","Harini M","Rahul S","Divya K"
]

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Career Roles
        for c in CAREERS:
            if not db.query(CareerRole).filter_by(name=c["name"]).first():
                db.add(CareerRole(name=c["name"], description=c["description"], required_skills=c["required_skills"], interest_keywords=c["interest_keywords"], market_signal=c["market_signal"]))
        
        # 2. Skills
        for name, cat in SKILLS:
            if not db.query(Skill).filter_by(name=name).first():
                db.add(Skill(name=name, category=cat))
        db.commit()

        # 3. Users
        admin = db.query(User).filter_by(email="admin@careerx.ai").first()
        if not admin:
            admin = User(email="admin@careerx.ai", full_name="CareerX Admin", password_hash=hash_password("demo123"), role="admin")
            db.add(admin)
            
        mentor = db.query(User).filter_by(email="mentor@careerx.ai").first()
        if not mentor:
            mentor = User(email="mentor@careerx.ai", full_name="Dr. Arun Mentor", password_hash=hash_password("demo123"), role="mentor")
            db.add(mentor)
            
        student_user = db.query(User).filter_by(email="student@careerx.ai").first()
        if not student_user:
            student_user = User(email="student@careerx.ai", full_name="Jayaseelan G", password_hash=hash_password("demo123"), role="student")
            db.add(student_user)
        db.commit()

        # 4. Institution Configuration
        if db.query(InstitutionConfig).count() == 0:
            db.add(InstitutionConfig(
                grading_scale=10.0,
                minimum_attendance=75.0,
                total_credits_required=160.0,
                weights_json={
                    "cgpa_performance": 0.30,
                    "sgpa_trend": 0.20,
                    "arrear_status": 0.20,
                    "credit_completion": 0.10,
                    "attendance": 0.10,
                    "subject_performance": 0.10
                },
                rules_json={
                    "needs_attention_cgpa": 6.5,
                    "needs_attention_attendance": 75.0,
                    "needs_attention_arrears": 1
                }
            ))
            db.commit()

        skill_map = {s.name: s for s in db.query(Skill).all()}
        profile_specs = [
            ("Jayaseelan G", "AI / ML Engineer", 8.42, 78, 91, 46, ["Artificial Intelligence", "Data Science", "Software Engineering"]),
            ("Ananya R", "Data Scientist", 8.90, 82, 94, 62, ["Data Science", "Artificial Intelligence"]),
            ("Arun K", "Data Engineer", 8.10, 68, 83, 35, ["Data Science", "Cloud Computing"]),
            ("Priya S", "AI / ML Engineer", 9.20, 81, 96, 70, ["Artificial Intelligence", "Data Science"]),
            ("Madhan R", "Software Engineer", 8.00, 72, 87, 51, ["Software Engineering", "Product Development"]),
            ("Keerthi V", "Data Scientist", 8.60, 76, 90, 58, ["Data Science", "Analytics"]),
            ("Naveen P", "Cloud / DevOps Engineer", 8.30, 73, 88, 52, ["Cloud Computing", "Software Engineering"]),
            ("Harini M", "Product Analyst", 8.50, 79, 91, 63, ["Product Development", "Data Science"]),
            ("Rahul S", "AI / ML Engineer", 7.90, 64, 82, 28, ["Artificial Intelligence"]),
            ("Divya K", "Data Engineer", 8.80, 74, 89, 55, ["Data Science", "Cloud Computing"]),
        ]

        created_profiles = []
        for idx, (name, target, cgpa, readiness, trust, roadmap, interests) in enumerate(profile_specs):
            email = "student@careerx.ai" if idx == 0 else f"student{idx+1}@careerx.ai"
            u = db.query(User).filter_by(email=email).first()
            if not u:
                u = student_user if idx == 0 else User(email=email, full_name=name, password_hash=hash_password("demo123"), role="student")
                if idx != 0:
                    db.add(u)
                    db.commit()
            profile = db.query(StudentProfile).filter_by(user_id=u.id).first()
            if not profile:
                profile = StudentProfile(
                    user_id=u.id, department="Artificial Intelligence and Data Science",
                    graduation_year=2027, cgpa=cgpa, target_role=target,
                    interests=interests, readiness_score=readiness,
                    trust_score=trust, roadmap_progress=roadmap
                )
                db.add(profile)
                db.commit()
            created_profiles.append(profile)

            # Skills & Projects
            if db.query(StudentSkill).filter_by(student_id=profile.id).count() == 0:
                base = {
                    "Python": 92 if idx in [0, 3] else 78 + idx,
                    "C++": 88 if idx == 0 else 72,
                    "SQL": 76 if idx == 0 else 66 + idx * 2,
                    "Machine Learning": 71 if idx in [0, 3] else 58 + idx * 2,
                    "React": 68 if idx in [0, 4] else 52,
                    "Java": 64 if idx == 0 else 55,
                    "Docker": 32 + idx * 4,
                    "AWS": 27 + idx * 5,
                    "Deep Learning": 48 + idx * 3,
                    "Statistics": 61 + idx * 2,
                    "Power BI": 45 + idx * 4,
                    "Linux": 60 + idx * 2,
                    "Spark": 25 + idx * 4
                }
                for sname, level in base.items():
                    sk = skill_map.get(sname)
                    if sk:
                        db.add(StudentSkill(student_id=profile.id, skill_id=sk.id, level=float(level), evidence=("Assessed" if sname in ["Python", "C++"] else ("Project" if sname in ["SQL", "Machine Learning"] else "Self reported"))))
                db.add(Project(student_id=profile.id, title=f"{'AI' if idx % 2 == 0 else 'Data'} Portfolio Project", description="Demonstration project with measurable evidence.", skills=["Python", "SQL", "Machine Learning"], evidence_url="https://github.com/", status="Project evidence", impact="+10% profile"))
                db.add(Certification(student_id=profile.id, name="Python Foundations", issuer="CareerX Demo Academy", status="Verified", verification_url="https://example.com/verify"))
        db.commit()

        # 5. Seed Academic Records & Subject Results for Students
        sem_blueprints = [
            # Sem 1
            {
                "sem": 1, "year": "2023-2024", "sgpa": 7.82, "cgpa": 7.82, "arrears": 2, "cleared": 0, "reg": 24, "earned": 22, "att": 82.0, "score": 76.0, "trend": "Stable",
                "subjects": [
                    ("MA101", "Linear Algebra & Calculus", 4.0, "B+", 8.0, "Passed", "Mathematics", 84.0),
                    ("PH101", "Engineering Physics", 3.0, "B", 7.0, "Passed", "Core Engineering", 80.0),
                    ("CS101", "Python Programming", 4.0, "A", 9.0, "Passed", "Programming", 91.0),
                    ("EE101", "Basic Electrical Engineering", 3.0, "F", 0.0, "Arrear", "Core Engineering", 72.0),
                    ("GE101", "Engineering Graphics", 3.0, "F", 0.0, "Arrear", "Core Engineering", 74.0)
                ]
            },
            # Sem 2
            {
                "sem": 2, "year": "2023-2024", "sgpa": 8.10, "cgpa": 7.96, "arrears": 1, "cleared": 1, "reg": 23, "earned": 23, "att": 84.0, "score": 79.5, "trend": "Improving",
                "subjects": [
                    ("MA102", "Discrete Mathematics", 4.0, "A", 9.0, "Passed", "Mathematics", 86.0),
                    ("CS102", "Data Structures in C++", 4.0, "A+", 9.5, "Passed", "Programming", 88.0),
                    ("CS103", "Digital Logic & Design", 3.0, "B+", 8.0, "Passed", "Systems", 81.0),
                    ("EE101", "Basic Electrical Engineering (Arrear)", 3.0, "B", 7.0, "Cleared", "Core Engineering", 82.0)
                ]
            },
            # Sem 3
            {
                "sem": 3, "year": "2024-2025", "sgpa": 8.35, "cgpa": 8.09, "arrears": 1, "cleared": 0, "reg": 24, "earned": 24, "att": 85.0, "score": 81.0, "trend": "Improving",
                "subjects": [
                    ("MA201", "Probability & Statistics", 4.0, "A+", 9.0, "Passed", "Statistics", 88.0),
                    ("CS201", "Database Management Systems", 4.0, "A", 9.0, "Passed", "Data Science", 86.0),
                    ("CS202", "Object Oriented Programming in Java", 3.0, "A", 9.0, "Passed", "Programming", 89.0),
                    ("CS203", "Operating Systems", 4.0, "F", 0.0, "Arrear", "Systems", 76.0),
                    ("CS204", "Computer Architecture", 3.0, "B+", 8.0, "Passed", "Systems", 82.0)
                ]
            },
            # Sem 4
            {
                "sem": 4, "year": "2024-2025", "sgpa": 8.71, "cgpa": 8.25, "arrears": 0, "cleared": 1, "reg": 24, "earned": 24, "att": 89.0, "score": 85.0, "trend": "Improving",
                "subjects": [
                    ("AI201", "Machine Learning Fundamentals", 4.0, "O", 10.0, "Passed", "AI / Data", 94.0),
                    ("CS205", "Design & Analysis of Algorithms", 4.0, "A+", 9.5, "Passed", "Programming", 91.0),
                    ("CS206", "Computer Networks", 3.0, "A", 9.0, "Passed", "Systems", 87.0),
                    ("GE101", "Engineering Graphics (Arrear)", 3.0, "B+", 8.0, "Cleared", "Core Engineering", 84.0),
                    ("CS207", "Web Technology & Fullstack", 3.0, "A", 9.0, "Passed", "Programming", 90.0)
                ]
            },
            # Sem 5
            {
                "sem": 5, "year": "2025-2026", "sgpa": 8.56, "cgpa": 8.42, "arrears": 1, "cleared": 0, "reg": 23, "earned": 23, "att": 86.0, "score": 82.0, "trend": "Stable",
                "subjects": [
                    ("AI301", "Deep Learning & Neural Networks", 4.0, "A+", 9.5, "Passed", "AI / Data", 89.0),
                    ("AI302", "Big Data Analytics & Spark", 3.0, "A", 9.0, "Passed", "Data Science", 88.0),
                    ("CS301", "Cloud Computing & DevOps", 3.0, "B+", 8.0, "Passed", "Cloud / DevOps", 85.0),
                    ("AI303", "Natural Language Processing", 4.0, "A", 9.0, "Passed", "AI / Data", 87.0),
                    ("PR301", "Mini Project Lab in AI", 2.0, "O", 10.0, "Passed", "Projects", 95.0)
                ]
            }
        ]

        for p_idx, profile in enumerate(created_profiles):
            if db.query(AcademicRecord).filter_by(student_id=profile.id).count() == 0:
                for bp in sem_blueprints:
                    # slight student variation
                    mult = 1.0 + (p_idx * 0.015 if p_idx % 2 == 0 else -p_idx * 0.015)
                    sgpa = round(min(9.9, max(6.0, bp["sgpa"] * mult)), 2)
                    cgpa = round(min(9.8, max(6.2, bp["cgpa"] * mult)), 2)
                    arrears = bp["arrears"] if p_idx == 0 else (0 if p_idx % 3 == 0 else (1 if bp["sem"] in [1, 3] else 0))
                    
                    rec = AcademicRecord(
                        student_id=profile.id,
                        semester=bp["sem"],
                        academic_year=bp["year"],
                        sgpa=sgpa,
                        cgpa=cgpa,
                        arrear_count=arrears,
                        cleared_arrear_count=bp["cleared"],
                        credits_registered=bp["reg"],
                        credits_earned=bp["earned"],
                        attendance_percentage=min(98.0, round(bp["att"] * (1.0 + (p_idx % 3)*0.02), 1)),
                        academic_progress_score=bp["score"],
                        trend=bp["trend"],
                        source="institution_import",
                        verification_status="Verified",
                        created_by=admin.id
                    )
                    db.add(rec)
                    db.flush()

                    for scode, sname, cred, grade, gp, status, cat, att in bp["subjects"]:
                        # Adjust for student arrears
                        subj_status = status
                        subj_grade = grade
                        subj_gp = gp
                        if arrears == 0 and status == "Arrear":
                            subj_status = "Passed"
                            subj_grade = "B+"
                            subj_gp = 8.0
                            
                        subj = SubjectResult(
                            academic_record_id=rec.id,
                            subject_code=scode,
                            subject_name=sname,
                            credits=cred,
                            grade=subj_grade,
                            grade_point=subj_gp,
                            status=subj_status,
                            category=cat,
                            attendance_percentage=att
                        )
                        db.add(subj)

                # Seed Academic Alerts for Student
                db.add(AcademicAlert(
                    student_id=profile.id,
                    type="Active Arrear",
                    severity="Warning" if p_idx == 0 else "Info",
                    message="1 active arrear remains in Operating Systems (Semester 3). Complete with faculty assistance." if p_idx == 0 else "All semester courses are cleared with no active backlogs.",
                    status="Active"
                ))
                db.add(AcademicAlert(
                    student_id=profile.id,
                    type="Academic Progress",
                    severity="Info",
                    message=f"Semester 4 SGPA reached {sem_blueprints[3]['sgpa']}, showing consistent growth in core AI coursework.",
                    status="Active"
                ))

                # Seed Academic Goal
                db.add(AcademicGoal(
                    student_id=profile.id,
                    mentor_id=mentor.id,
                    title="Clear Operating Systems arrear" if p_idx == 0 else "Maintain SGPA above 8.5 in core AI subjects",
                    description="Schedule 1-on-1 review with course instructor and complete 3 past exam problem sets.",
                    target_value="Grade >= B+",
                    deadline=date.today() + timedelta(days=45),
                    priority="High" if p_idx == 0 else "Medium",
                    progress=40.0 if p_idx == 0 else 75.0,
                    status="In Progress"
                ))

        db.commit()

        # 6. Mentor Assignments
        profiles = db.query(StudentProfile).order_by(StudentProfile.id).limit(10).all()
        for p in profiles:
            if not db.query(MentorAssignment).filter_by(mentor_id=mentor.id, student_id=p.id, status="active").first():
                db.add(MentorAssignment(mentor_id=mentor.id, student_id=p.id))
        db.commit()

        # 7. Mentor Alerts
        if db.query(MentorAlert).filter_by(mentor_id=mentor.id).count() == 0:
            for p, sev, title, msg in [
                (profiles[0], "medium", "Academic arrear review", "Discuss Operating Systems backlog clearance and DL roadmap progress."),
                (profiles[2], "high", "Certification needs review", "A cloud certificate is recommended for the target role."),
                (profiles[4], "medium", "Project evidence missing", "Upload a working demo link for the latest project.")
            ]:
                db.add(MentorAlert(mentor_id=mentor.id, student_id=p.id, severity=sev, title=title, message=msg))
        db.commit()
        print("CareerX seed complete with full Academic Intelligence module. Demo credentials: student@careerx.ai / demo123; mentor@careerx.ai / demo123; admin@careerx.ai / demo123")
    finally:
        db.close()
