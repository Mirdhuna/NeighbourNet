from __future__ import annotations
from fastapi import APIRouter, HTTPException, status

from app.core.deps import CurrentUser, DbConn
from app.db import procedures
from app.schemas.profile import ProfileOut, ProfileUpdate
from app.services import map_profile

router = APIRouter()


@router.get("", response_model=ProfileOut)
def get_profile(conn: DbConn, user: CurrentUser):
    row = procedures.fn_get_profile(conn, int(user["user_id"]))
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return map_profile(row)


@router.patch("", response_model=ProfileOut)
def update_profile(body: ProfileUpdate, conn: DbConn, user: CurrentUser):
    procedures.sp_update_profile(
        conn,
        user_id=int(user["user_id"]),
        name=body.name,
        phone=body.phone,
        address=body.location,
        bio=body.bio,
        email=str(body.email) if body.email else None,
        radius=body.preferred_radius,
    )
    row = procedures.fn_get_profile(conn, int(user["user_id"]))
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return map_profile(row)
