from fastapi import APIRouter

from app.core.deps import CurrentUser, DbConn
from app.db import procedures
from app.schemas.needs import CategoryOut

router = APIRouter()


@router.get("", response_model=list[CategoryOut])
def list_categories(conn: DbConn, _user: CurrentUser):
    return procedures.list_categories(conn)
