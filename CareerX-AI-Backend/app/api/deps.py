
from fastapi import Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..security import get_current_user

Db = Session
def db() -> Session:
    return next(get_db())
