from __future__ import annotations
from typing import List, Dict, Optional, Any, Union
from fastapi import APIRouter

from app.core.deps import DbConn, OptionalCurrentUser
from app.db import procedures
from app.schemas.needs import CategoryOut

router = APIRouter()


@router.get("", response_model=List[CategoryOut])
def list_categories(conn: DbConn, _user: OptionalCurrentUser = None):
    return procedures.list_categories(conn)
