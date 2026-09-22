
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import User, StudentProfile, Skill, StudentSkill
from ..schemas import RegisterRequest, LoginRequest, AuthResponse, UserOut
from ..security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(400, "Email already registered")
    user = User(email=payload.email.lower(), full_name=payload.full_name, password_hash=hash_password(payload.password), role="student")
    db.add(user); db.flush()
    profile = StudentProfile(user_id=user.id, department=payload.department, graduation_year=payload.graduation_year)
    db.add(profile); db.flush()
    for name, level, category, evidence in [
        ("Python", 70, "AI / Data", "Self reported"),
        ("SQL", 55, "Data", "Self reported"),
        ("Machine Learning", 45, "AI / Data", "Self reported"),
    ]:
        skill = db.query(Skill).filter(Skill.name == name).first()
        if not skill:
            skill = Skill(name=name, category=category); db.add(skill); db.flush()
        db.add(StudentSkill(student_id=profile.id, skill_id=skill.id, level=level, evidence=evidence))
    db.commit(); db.refresh(user)
    return AuthResponse(access_token=create_access_token(user), user=UserOut.model_validate(user))

@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password. Please check your credentials and try again.")
    if not user.is_active:
        if user.role == "mentor":
            raise HTTPException(403, "Your Mentor account is currently inactive. Please contact the administrator.")
        elif user.role == "admin":
            raise HTTPException(403, "Administrative access is currently unavailable.")
        else:
            raise HTTPException(403, "Your account is currently inactive. Please contact the administrator.")
    if payload.role and user.role != payload.role.lower():
        if payload.role.lower() == "mentor":
            raise HTTPException(403, "This account does not have Mentor access. Please use the appropriate CareerX AI portal.")
        elif payload.role.lower() == "admin":
            raise HTTPException(403, "This account does not have Admin access. Please use the appropriate CareerX AI portal.")
        elif payload.role.lower() == "student":
            raise HTTPException(403, "This account does not have Student access. Please use the appropriate CareerX AI portal.")
        else:
            raise HTTPException(403, f"This account does not have {payload.role.capitalize()} access.")
    return AuthResponse(access_token=create_access_token(user), user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)
