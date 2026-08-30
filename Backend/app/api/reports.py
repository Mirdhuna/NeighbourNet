from __future__ import annotations
from fastapi import APIRouter, status

from app.core.deps import CurrentUser, DbConn
from app.db import procedures
from app.schemas.reports import ReportCreate, ReportCreated

router = APIRouter()


@router.post("/needs/{need_id}/report", response_model=ReportCreated, status_code=status.HTTP_201_CREATED)
def report_need(need_id: int, body: ReportCreate, conn: DbConn, user: CurrentUser):
    procedures.sp_report_need(conn, int(user["user_id"]), need_id, body.reason)
    return ReportCreated()


@router.post("/offers/{offer_id}/report", response_model=ReportCreated, status_code=status.HTTP_201_CREATED)
def report_offer(offer_id: int, body: ReportCreate, conn: DbConn, user: CurrentUser):
    procedures.sp_report_offer(conn, int(user["user_id"]), offer_id, body.reason)
    return ReportCreated()
