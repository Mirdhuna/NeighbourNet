"""Helpers that map PostgreSQL rows to frontend-shaped JSON."""

from datetime import datetime
from decimal import Decimal
from typing import Any


def to_float(value: Any) -> float | None:
    if value is None:
        return None
    return float(value) if isinstance(value, Decimal) else float(value)


def to_int(value: Any) -> int | None:
    if value is None:
        return None
    return int(value)


def to_str(value: Any) -> str | None:
    if value is None:
        return None
    return str(value)


def tags_list(value: Any) -> list[str]:
    if not value:
        return []
    return [str(item) for item in value]


def format_joined(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)


def format_listing_time(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.strftime("%d %b %Y %H:%M")
    return str(value)


def map_need(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": to_int(row.get("id") or row.get("need_id")),
        "title": row.get("title"),
        "description": row.get("description"),
        "category": row.get("category"),
        "urgency": to_str(row.get("urgency")),
        "duration": row.get("duration"),
        "location": row.get("location"),
        "distance": to_float(row.get("distance")),
        "tags": tags_list(row.get("tags")),
        "requesterName": row.get("requester_name"),
        "requesterInitial": row.get("requester_initial"),
        "verified": row.get("verified"),
        "trust_score": to_float(row.get("trust_score")),
        "time": row.get("time") or format_listing_time(row.get("created_date")),
        "photo": row.get("photo"),
        "status": to_str(row.get("status")),
        "owner_user_id": to_int(row.get("owner_user_id")),
    }


def map_offer(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": to_int(row.get("id") or row.get("offer_id")),
        "title": row.get("title"),
        "description": row.get("description"),
        "category": row.get("category"),
        "condition": row.get("condition"),
        "availability": row.get("availability"),
        "pickupOption": row.get("pickup_option"),
        "location": row.get("location"),
        "distance": to_float(row.get("distance")),
        "tags": tags_list(row.get("tags")),
        "ownerName": row.get("owner_name"),
        "ownerInitial": row.get("owner_initial"),
        "verified": row.get("verified"),
        "trust_score": to_float(row.get("trust_score")),
        "time": row.get("time") or format_listing_time(row.get("created_date")),
        "photo": row.get("photo"),
        "status": to_str(row.get("status")),
        "type": row.get("type"),
        "owner_user_id": to_int(row.get("owner_user_id")),
    }


def map_profile(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "user_id": to_int(row.get("user_id")),
        "name": row.get("name"),
        "username": row.get("username"),
        "email": row.get("email"),
        "phone": row.get("phone"),
        "bio": row.get("bio"),
        "location": row.get("location"),
        "verified": bool(row.get("verified")),
        "trust_score": to_float(row.get("trust_score")) or 0.0,
        "joined_at": format_joined(row.get("joined_at")),
        "initial": row.get("initial"),
    }


def map_settings(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "user_id": to_int(row.get("user_id")),
        "name": row.get("name"),
        "username": row.get("username"),
        "email": row.get("email"),
        "phone": row.get("phone"),
        "push_alerts": bool(row.get("push_alerts")),
        "sms_alerts": bool(row.get("sms_alerts")),
        "email_alerts": bool(row.get("email_alerts")),
        "public_profile": bool(row.get("public_profile")),
        "show_location": row.get("show_location"),
        "language": row.get("language"),
        "dark_mode": bool(row.get("dark_mode")),
        "visibility": row.get("visibility"),
    }


def map_bookmark(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": to_int(row.get("id")),
        "bookmarkType": row.get("bookmark_type"),
        "title": row.get("title"),
        "description": row.get("description"),
        "location": row.get("location"),
        "distance": to_float(row.get("distance")),
        "time": row.get("time"),
        "urgency": row.get("urgency"),
        "condition": row.get("condition"),
        "category": row.get("category"),
        "tags": tags_list(row.get("tags")),
        "requesterInitial": row.get("requester_initial"),
        "requesterName": row.get("requester_name"),
        "ownerInitial": row.get("owner_initial"),
        "ownerName": row.get("owner_name"),
        "verified": row.get("verified"),
    }


def map_conversation(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": to_int(row.get("id")),
        "name": row.get("name"),
        "initial": row.get("initial"),
        "online": bool(row.get("online")),
        "unread": to_int(row.get("unread")) or 0,
        "updatedAt": row.get("updated_at"),
    }


def map_message(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": to_int(row.get("id")),
        "sender_id": to_int(row.get("sender_id")),
        "sender_name": row.get("sender_name"),
        "text": row.get("message_text"),
        "from_": row.get("message_from"),
        "time": row.get("message_time"),
        "is_read": row.get("is_read"),
    }
