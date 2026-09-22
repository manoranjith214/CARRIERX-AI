
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from .seed import seed
from .api import auth, student, mentor, admin, system, academic

settings=get_settings()
app=FastAPI(title=settings.app_name, version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(system.router, prefix=settings.api_prefix)
app.include_router(auth.router, prefix=settings.api_prefix)
app.include_router(student.router, prefix=settings.api_prefix)
app.include_router(academic.router, prefix=settings.api_prefix)
app.include_router(mentor.router, prefix=settings.api_prefix)
app.include_router(admin.router, prefix=settings.api_prefix)

@app.on_event("startup")
def on_startup():
    seed()
