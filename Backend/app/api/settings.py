from __future__ import annotations
from fastapi import APIRouter, HTTPException, status

from app.core.deps import CurrentUser, DbConn
from app.db import procedures
from app.schemas.auth import MessageResponse
from app.schemas.settings import SettingsOut, SettingsUpdate
from app.services import map_settings

router = APIRouter()


@router.get("/settings", response_model=SettingsOut)
def get_settings(conn: DbConn, user: CurrentUser):
    row = procedures.fn_get_settings(conn, int(user["user_id"]))
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Settings not found")
    return map_settings(row)


@router.patch("/settings", response_model=SettingsOut)
def update_settings(body: SettingsUpdate, conn: DbConn, user: CurrentUser):
    user_id = int(user["user_id"])
    current = procedures.fn_get_settings(conn, user_id)
    if current is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Settings not found")

    # sp_update_profile does not accept username. Reject a real username change.
    if body.username is not None and body.username != current.get("username"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username cannot be changed; no SQL procedure updates users.username",
        )

    profile_touched = any(value is not None for value in (body.name, body.phone, body.email))
    if profile_touched:
        procedures.sp_update_profile(
            conn,
            user_id=user_id,
            name=body.name,
            phone=body.phone,
            address=None,
            bio=None,
            email=str(body.email) if body.email else None,
            radius=None,
        )

    procedures.sp_update_settings(
        conn,
        user_id=user_id,
        push_alerts=body.pushAlerts,
        sms_alerts=body.smsAlerts,
        email_alerts=body.emailAlerts,
        public_profile=body.profilePublic,
        show_location=body.showLocation,
        language=body.language,
        dark_mode=body.darkMode,
        visibility=body.visibility,
    )
    row = procedures.fn_get_settings(conn, user_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Settings not found")
    return map_settings(row)


@router.post("/account/deactivate", response_model=MessageResponse)
def deactivate_account(conn: DbConn, user: CurrentUser):
    procedures.sp_deactivate_account(conn, int(user["user_id"]))
    return MessageResponse(detail="Account deactivated")
