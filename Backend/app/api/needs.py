from __future__ import annotations
from typing import List, Dict, Optional, Any, Union
from fastapi import APIRouter, HTTPException, Query, status

from app.core.deps import CurrentUser, OptionalCurrentUser, DbConn
from app.db import procedures
from app.schemas.auth import MessageResponse
from app.schemas.needs import NeedCreate, NeedCreated, NeedOut
from app.services import map_need

router = APIRouter()


@router.get("/mine", response_model=List[NeedOut])
def my_needs(conn: DbConn, user: CurrentUser):
    rows = procedures.list_my_needs(conn, int(user["user_id"]))
    return [map_need(row) for row in rows]


@router.get("", response_model=List[NeedOut])
def search_needs(
    conn: DbConn,
    _user: OptionalCurrentUser = None,
    q: str | None = Query(default=None),
    category: str | None = Query(default="All"),
    urgency: str | None = Query(default="All"),
    verified_only: bool = Query(default=False),
    radius: float = Query(default=5),
    sort: str = Query(default="latest"),
):
    rows = procedures.fn_search_needs_frontend(
        conn,
        radius=radius,
        query=q,
        category=category,
        urgency=urgency,
        verified_only=verified_only,
        sort=sort,
    )
    return [map_need(row) for row in rows]


@router.get("/{need_id}", response_model=NeedOut)
def get_need(need_id: int, conn: DbConn, _user: OptionalCurrentUser = None):
    row = procedures.fn_get_need_frontend(conn, need_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Need not found")
    return map_need(row)


@router.post("", response_model=NeedCreated, status_code=status.HTTP_201_CREATED)
def create_need(body: NeedCreate, conn: DbConn, user: CurrentUser):
    need_id = procedures.sp_post_need(
        conn,
        user_id=int(user["user_id"]),
        category_name=body.category,
        title=body.title,
        description=body.description,
        urgency=body.urgency,
        duration=body.duration,
        location=body.location,
        radius=body.radius,
        photo=body.photo,
        tags=body.tags,
    )
    if need_id is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Need was not created")
    return NeedCreated(id=need_id)


@router.delete("/{need_id}", response_model=MessageResponse)
def delete_need(need_id: int, conn: DbConn, user: CurrentUser):
    procedures.sp_remove_need(conn, int(user["user_id"]), need_id)
    return MessageResponse(detail="Need removed")
