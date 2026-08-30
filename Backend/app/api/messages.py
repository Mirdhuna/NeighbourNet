from fastapi import APIRouter, status

from app.core.deps import CurrentUser, DbConn
from app.db import procedures
from app.schemas.messages import (
    ConversationCreate,
    ConversationCreated,
    ConversationOut,
    MessageCreate,
    MessageOut,
)
from app.schemas.auth import MessageResponse
from app.services import map_conversation, map_message

router = APIRouter()


@router.get("", response_model=list[ConversationOut])
def list_conversations(conn: DbConn, user: CurrentUser):
    rows = procedures.fn_get_conversations(conn, int(user["user_id"]))
    return [map_conversation(row) for row in rows]


@router.post("", response_model=ConversationCreated, status_code=status.HTTP_201_CREATED)
def create_conversation(body: ConversationCreate, conn: DbConn, user: CurrentUser):
    conversation_id = procedures.fn_get_or_create_conversation(
        conn,
        int(user["user_id"]),
        body.other_user_id,
    )
    return ConversationCreated(id=conversation_id)


@router.get("/{conversation_id}/messages", response_model=list[MessageOut])
def list_messages(conversation_id: int, conn: DbConn, user: CurrentUser):
    rows = procedures.fn_get_messages(conn, int(user["user_id"]), conversation_id)
    return [map_message(row) for row in rows]


@router.post("/{conversation_id}/messages", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def send_message(conversation_id: int, body: MessageCreate, conn: DbConn, user: CurrentUser):
    message_id = procedures.fn_send_message(
        conn,
        int(user["user_id"]),
        conversation_id,
        body.text,
    )
    rows = procedures.fn_get_messages(conn, int(user["user_id"]), conversation_id)
    for row in rows:
        if int(row["id"]) == message_id:
            return map_message(row)
    return {
        "id": message_id,
        "sender_id": int(user["user_id"]),
        "sender_name": user.get("name"),
        "text": body.text,
        "from_": "me",
        "time": None,
        "is_read": False,
    }


@router.post("/{conversation_id}/read", response_model=MessageResponse)
def mark_read(conversation_id: int, conn: DbConn, user: CurrentUser):
    procedures.sp_mark_conversation_read(conn, int(user["user_id"]), conversation_id)
    return MessageResponse(detail="Conversation marked read")


@router.delete("/{conversation_id}", response_model=MessageResponse)
def delete_conversation(conversation_id: int, conn: DbConn, user: CurrentUser):
    procedures.sp_delete_conversation(conn, int(user["user_id"]), conversation_id)
    return MessageResponse(detail="Conversation deleted")
