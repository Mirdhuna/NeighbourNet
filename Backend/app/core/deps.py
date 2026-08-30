from __future__ import annotations
from typing import List, Dict, Optional, Any, Union, Any
try:
    from typing import Annotated
except ImportError:
    from typing_extensions import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from psycopg import Connection

from app.core.security import ROLE_ADMIN, ROLE_USER, decode_access_token
from app.db import procedures
from app.db.session import get_connection

bearer_scheme = HTTPBearer(auto_error=False)

DbConn = Annotated[Connection, Depends(get_connection)]


def _credentials(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> HTTPAuthorizationCredentials:
    if creds is None or not creds.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return creds


def _payload(creds: HTTPAuthorizationCredentials = Depends(_credentials)) -> dict:
    try:
        return decode_access_token(creds.credentials)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def get_current_user(
    conn: DbConn,
    payload: dict = Depends(_payload),
) -> Dict[str, Any]:
    if payload.get("role") != ROLE_USER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User token required",
        )
    try:
        user_id = int(payload.get("sub", ""))
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
        ) from exc

    user = procedures.fetch_active_user(conn, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return user


def get_current_admin(
    conn: DbConn,
    payload: dict = Depends(_payload),
) -> Dict[str, Any]:
    if payload.get("role") != ROLE_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin token required",
        )
    try:
        admin_id = int(payload.get("sub", ""))
    except (TypeError, ValueError) as orig:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
        ) from orig

    admin = procedures.fetch_admin(conn, admin_id)
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found",
        )
    return admin


def get_optional_current_user(
    conn: DbConn,
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> Dict[str, Any] | None:
    if creds is None or not creds.credentials:
        return None
    try:
        payload = decode_access_token(creds.credentials)
        if payload.get("role") != ROLE_USER:
            return None
        user_id = int(payload.get("sub", ""))
        return procedures.fetch_active_user(conn, user_id)
    except Exception:
        return None


CurrentUser = Annotated[Dict[str, Any], Depends(get_current_user)]
OptionalCurrentUser = Annotated[Optional[Dict[str, Any]], Depends(get_optional_current_user)]
CurrentAdmin = Annotated[Dict[str, Any], Depends(get_current_admin)]
