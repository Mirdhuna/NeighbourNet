from __future__ import annotations
from fastapi import APIRouter, HTTPException, status

from app.core.deps import CurrentUser, DbConn
from app.core.security import ROLE_USER, create_access_token
from app.db import procedures
from app.schemas.auth import LoginRequest, MessageResponse, RegisterRequest, TokenResponse, UserSummary
from app.services import map_profile, to_float

router = APIRouter()


def _token_for_login_row(row: dict) -> TokenResponse:
    if not row or not row.get("is_valid"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password",
        )
    token = create_access_token(subject_id=int(row["user_id"]), role=ROLE_USER)
    return TokenResponse(
        access_token=token,
        user=UserSummary(
            user_id=int(row["user_id"]),
            name=row["name"],
            email=row["email"],
            username=row["username"],
            is_verified=bool(row["is_verified"]),
            trust_score=to_float(row["trust_score"]) or 0.0,
        ),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, conn: DbConn):
    procedures.sp_register_user(
        conn,
        name=body.name,
        username=body.username,
        email=str(body.email),
        password=body.password,
        phone=body.phone,
        address=body.address,
        radius=body.preferred_radius,
    )
    row = procedures.fn_login(conn, str(body.email), body.password)
    return _token_for_login_row(row)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, conn: DbConn):
    row = procedures.fn_login(conn, body.email, body.password)
    return _token_for_login_row(row)


@router.post("/logout", response_model=MessageResponse)
def logout(_user: CurrentUser):
    """JWT is stateless; the client should discard the token."""
    return MessageResponse(detail="Logged out")


@router.get("/me")
def me(conn: DbConn, user: CurrentUser):
    profile = procedures.fn_get_profile(conn, int(user["user_id"]))
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return map_profile(profile)
