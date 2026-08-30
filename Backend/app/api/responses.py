from fastapi import APIRouter, status

from app.core.deps import CurrentUser, DbConn
from app.db import procedures
from app.schemas.responses import CompleteExchange, RespondToNeed, ResponseCreated, StatusMessage

router = APIRouter()


@router.post("/needs/{need_id}/respond", response_model=ResponseCreated, status_code=status.HTTP_201_CREATED)
def respond_to_need(need_id: int, body: RespondToNeed, conn: DbConn, user: CurrentUser):
    response_id = procedures.sp_respond_to_need(
        conn,
        need_id=need_id,
        user_id=int(user["user_id"]),
        offer_id=body.offer_id,
        message=body.message,
    )
    return ResponseCreated(response_id=response_id)


@router.post("/responses/{response_id}/accept", response_model=StatusMessage)
def accept_response(response_id: int, conn: DbConn, user: CurrentUser):
    procedures.sp_accept_response(conn, response_id, int(user["user_id"]))
    return StatusMessage(detail="Response accepted")


@router.post("/responses/{response_id}/reject", response_model=StatusMessage)
def reject_response(response_id: int, conn: DbConn, user: CurrentUser):
    procedures.sp_reject_response(conn, response_id, int(user["user_id"]))
    return StatusMessage(detail="Response rejected")


@router.post("/needs/{need_id}/complete", response_model=StatusMessage)
def complete_exchange(need_id: int, body: CompleteExchange, conn: DbConn, _user: CurrentUser):
    procedures.sp_mark_exchange_completed(conn, need_id, body.response_id)
    return StatusMessage(detail="Exchange marked completed")
