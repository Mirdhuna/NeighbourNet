from __future__ import annotations
from typing import List, Dict, Optional, Any, Union
from fastapi import APIRouter, Query

from app.core.deps import CurrentUser, DbConn
from app.db import procedures
from app.schemas.bookmarks import BookmarkCheckOut, BookmarkOut, BookmarkToggle, BookmarkToggleOut
from app.services import map_bookmark

router = APIRouter()


@router.get("", response_model=List[BookmarkOut])
def list_bookmarks(conn: DbConn, user: CurrentUser):
    rows = procedures.fn_get_bookmarks(conn, int(user["user_id"]))
    return [map_bookmark(row) for row in rows]


@router.post("/toggle", response_model=BookmarkToggleOut)
def toggle_bookmark(body: BookmarkToggle, conn: DbConn, user: CurrentUser):
    bookmarked = procedures.fn_toggle_bookmark(
        conn,
        int(user["user_id"]),
        body.item_id,
        body.item_type,
    )
    return BookmarkToggleOut(
        item_id=body.item_id,
        item_type=body.item_type,
        bookmarked=bookmarked,
    )


@router.get("/check", response_model=BookmarkCheckOut)
def check_bookmark(
    conn: DbConn,
    user: CurrentUser,
    item_id: int = Query(),
    item_type: str = Query(pattern="^(need|offer)$"),
):
    bookmarked = procedures.fn_is_bookmarked(
        conn,
        int(user["user_id"]),
        item_id,
        item_type,
    )
    return BookmarkCheckOut(item_id=item_id, item_type=item_type, bookmarked=bookmarked)
