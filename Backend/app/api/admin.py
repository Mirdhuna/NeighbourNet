from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.deps import CurrentAdmin, DbConn, bearer_scheme
from app.core.security import ROLE_ADMIN, create_access_token, decode_access_token
from app.db import procedures
from app.schemas.admin import (
    AdminActivityOut,
    AdminLoginRequest,
    AdminRegisterRequest,
    AdminStatsOut,
    AdminSummary,
    AdminTokenResponse,
)
from app.schemas.auth import MessageResponse
from app.services import to_int

router = APIRouter()


def _ensure_admin_or_bootstrap(
    conn,
    creds: HTTPAuthorizationCredentials | None,
) -> None:
    """Allow unauthenticated register only when the admin table is empty."""
    if procedures.count_admins(conn) == 0:
        return
    if creds is None or not creds.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin token required to register additional admins",
        )
    try:
        payload = decode_access_token(creds.credentials)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    if payload.get("role") != ROLE_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin token required")
    admin = procedures.fetch_admin(conn, int(payload["sub"]))
    if admin is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin not found")


@router.post("/login", response_model=AdminTokenResponse)
def admin_login(body: AdminLoginRequest, conn: DbConn):
    row = procedures.admin_login(conn, body.email, body.password)
    if not row or not row.get("is_valid"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
        )
    token = create_access_token(subject_id=int(row["admin_id"]), role=ROLE_ADMIN)
    return AdminTokenResponse(
        access_token=token,
        admin=AdminSummary(
            admin_id=int(row["admin_id"]),
            name=row["name"],
            email=row["email"],
            username=row["username"],
        ),
    )


@router.post("/register", response_model=AdminSummary, status_code=status.HTTP_201_CREATED)
def admin_register(
    body: AdminRegisterRequest,
    conn: DbConn,
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
):
    _ensure_admin_or_bootstrap(conn, creds)
    admin_id = procedures.sp_register_admin(
        conn,
        name=body.name,
        username=body.username,
        email=str(body.email),
        password=body.password,
    )
    if admin_id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin was not created",
        )
    admin = procedures.fetch_admin(conn, admin_id)
    if admin is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Admin was not created")
    return AdminSummary(
        admin_id=int(admin["admin_id"]),
        name=admin["name"],
        email=admin["email"],
        username=admin["username"],
    )


@router.get("/stats", response_model=AdminStatsOut)
def admin_stats(conn: DbConn, _admin: CurrentAdmin):
    row = procedures.fn_admin_dashboard_stats(conn) or {}
    return AdminStatsOut(
        total_users=to_int(row.get("total_users")) or 0,
        active_needs=to_int(row.get("active_needs")) or 0,
        active_offers=to_int(row.get("active_offers")) or 0,
        total_completed=to_int(row.get("total_completed")) or 0,
        total_responses=to_int(row.get("total_responses")) or 0,
        resolved_today=to_int(row.get("resolved_today")) or 0,
        pending_responses=to_int(row.get("pending_responses")) or 0,
        verified_users=to_int(row.get("verified_users")) or 0,
    )


@router.get("/activity", response_model=list[AdminActivityOut])
def admin_activity(
    conn: DbConn,
    _admin: CurrentAdmin,
    limit: int = Query(default=20, ge=1, le=100),
):
    return procedures.fn_admin_recent_activity(conn, limit)


@router.post("/posts/{post_type}/{post_id}/remove", response_model=MessageResponse)
def admin_remove_post(post_type: str, post_id: int, conn: DbConn, _admin: CurrentAdmin):
    if post_type.lower() not in {"need", "offer"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="post_type must be need or offer")
    procedures.sp_admin_remove_post(conn, post_type, post_id)
    return MessageResponse(detail="Post removed")


@router.post("/users/{user_id}/deactivate", response_model=MessageResponse)
def admin_deactivate_user(user_id: int, conn: DbConn, _admin: CurrentAdmin):
    procedures.sp_admin_deactivate_user(conn, user_id)
    return MessageResponse(detail="User deactivated")
