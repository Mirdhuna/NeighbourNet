"""Wrappers around existing PostgreSQL functions, procedures, views, and tables.

No business rules are reimplemented here. Every query names an object from
NeighborNet_Backend_FIXED.sql (or a plain SELECT on an existing table).

PostgreSQL notes:
- TABLE functions are queried with SELECT * FROM fn_name(...).
- Scalar functions are queried with SELECT fn_name(...).
- Procedures are invoked with CALL. Procedures that have INOUT parameters
  return those values as a result row in PostgreSQL 14+.
- Passwords are hashed by pgcrypto inside the SQL. Python must pass plaintext.
"""

from typing import Any

from psycopg import Connection
from psycopg.errors import Error as PsycopgError, RaiseException

from app.db.exceptions import ProcedureError


def _message(exc: RaiseException) -> str:
    if exc.diag and exc.diag.message_primary:
        return exc.diag.message_primary
    return str(exc)


def _execute(conn: Connection, query: str, params: tuple | dict | None = None):
    try:
        return conn.execute(query, params)
    except RaiseException as exc:
        raise ProcedureError(_message(exc)) from exc
    except PsycopgError as exc:
        # Unhandled DB errors (e.g. argument type mismatch) must become JSON
        # responses so CORS headers are still applied.
        raise ProcedureError(_message(exc) or "Database error") from exc


def _fetchone(conn: Connection, query: str, params: tuple | dict | None = None) -> dict[str, Any] | None:
    cur = _execute(conn, query, params)
    return cur.fetchone()


def _fetchall(conn: Connection, query: str, params: tuple | dict | None = None) -> list[dict[str, Any]]:
    cur = _execute(conn, query, params)
    return list(cur.fetchall())


def _scalar(conn: Connection, query: str, params: tuple | dict | None = None) -> Any:
    row = _fetchone(conn, query, params)
    if row is None:
        return None
    return next(iter(row.values()))


def _call(conn: Connection, query: str, params: tuple | dict | None = None) -> dict[str, Any] | None:
    """CALL a procedure. Fetch INOUT/OUT result row when PostgreSQL returns one."""
    cur = _execute(conn, query, params)
    if cur.description:
        return cur.fetchone()
    return None


def _inout_id(row: dict[str, Any] | None) -> int | None:
    if not row:
        return None
    for value in row.values():
        if value is not None:
            return int(value)
    return None


# ---------------------------------------------------------------------------
# Table reads used only for auth session checks (no matching SQL function)
# ---------------------------------------------------------------------------

def fetch_active_user(conn: Connection, user_id: int) -> dict[str, Any] | None:
    return _fetchone(
        conn,
        """
        SELECT user_id, name, username, email, is_verified, trust_score, is_active
        FROM users
        WHERE user_id = %s AND is_active = TRUE
        """,
        (user_id,),
    )


def fetch_admin(conn: Connection, admin_id: int) -> dict[str, Any] | None:
    return _fetchone(
        conn,
        """
        SELECT admin_id, name, username, email
        FROM admin
        WHERE admin_id = %s
        """,
        (admin_id,),
    )


def count_admins(conn: Connection) -> int:
    value = _scalar(conn, "SELECT COUNT(*) FROM admin")
    return int(value or 0)


def admin_login(conn: Connection, login: str, password: str) -> dict[str, Any] | None:
    """There is no fn_admin_login. Mirror fn_login against the admin table + crypt()."""
    return _fetchone(
        conn,
        """
        SELECT
            a.admin_id,
            a.name,
            a.email,
            a.username,
            (a.password_hash = crypt(%s, a.password_hash)) AS is_valid
        FROM admin a
        WHERE lower(a.email) = lower(trim(%s))
           OR lower(a.username) = lower(trim(%s))
        """,
        (password, login, login),
    )


def list_categories(conn: Connection) -> list[dict[str, Any]]:
    return _fetchall(
        conn,
        """
        SELECT category_id, category_name, category_description
        FROM categories
        ORDER BY category_name
        """,
    )


def list_my_needs(conn: Connection, user_id: int) -> list[dict[str, Any]]:
    return _fetchall(
        conn,
        """
        SELECT *
        FROM vw_frontend_needs
        WHERE owner_user_id = %s
        ORDER BY created_date DESC
        """,
        (user_id,),
    )


def list_my_offers(conn: Connection, user_id: int) -> list[dict[str, Any]]:
    return _fetchall(
        conn,
        """
        SELECT *
        FROM vw_frontend_offers
        WHERE owner_user_id = %s
        ORDER BY created_date DESC
        """,
        (user_id,),
    )


# ---------------------------------------------------------------------------
# Auth / profile / settings
# ---------------------------------------------------------------------------

def sp_register_user(
    conn: Connection,
    *,
    name: str,
    username: str,
    email: str,
    password: str,
    phone: str | None,
    address: str | None,
    radius: float | None,
) -> int | None:
    row = _call(
        conn,
        """
        CALL sp_register_user(
            p_name := %s::varchar,
            p_username := %s::varchar,
            p_email := %s::varchar,
            p_password := %s::text,
            p_phone := %s::varchar,
            p_address := %s::varchar,
            p_radius := %s::numeric,
            p_user_id := %s::bigint
        )
        """,
        (name, username, email, password, phone, address, radius, None),
    )
    user_id = _inout_id(row)
    if user_id is not None:
        return user_id
    fallback = _fetchone(
        conn,
        "SELECT user_id FROM users WHERE lower(email) = lower(trim(%s))",
        (email,),
    )
    return int(fallback["user_id"]) if fallback else None


def fn_login(conn: Connection, login: str, password: str) -> dict[str, Any] | None:
    return _fetchone(
        conn,
        "SELECT * FROM fn_login(%s, %s)",
        (login, password),
    )


def fn_get_profile(conn: Connection, user_id: int) -> dict[str, Any] | None:
    return _fetchone(conn, "SELECT * FROM fn_get_profile(%s::bigint)", (user_id,))


def sp_update_profile(
    conn: Connection,
    *,
    user_id: int,
    name: str | None,
    phone: str | None,
    address: str | None,
    bio: str | None,
    email: str | None,
    radius: float | None,
) -> None:
    _call(
        conn,
        """
        CALL sp_update_profile(
            p_user_id := %s::bigint,
            p_name := %s::varchar,
            p_phone := %s::varchar,
            p_address := %s::varchar,
            p_bio := %s::text,
            p_email := %s::varchar,
            p_radius := %s::numeric
        )
        """,
        (user_id, name, phone, address, bio, email, radius),
    )


def sp_deactivate_account(conn: Connection, user_id: int) -> None:
    _call(conn, "CALL sp_deactivate_account(%s::bigint)", (user_id,))


def fn_get_settings(conn: Connection, user_id: int) -> dict[str, Any] | None:
    return _fetchone(conn, "SELECT * FROM fn_get_settings(%s::bigint)", (user_id,))


def sp_update_settings(
    conn: Connection,
    *,
    user_id: int,
    push_alerts: bool | None,
    sms_alerts: bool | None,
    email_alerts: bool | None,
    public_profile: bool | None,
    show_location: bool | None,
    language: str | None,
    dark_mode: bool | None,
    visibility: str | None,
) -> None:
    _call(
        conn,
        """
        CALL sp_update_settings(
            p_user_id := %s::bigint,
            p_push_alerts := %s::boolean,
            p_sms_alerts := %s::boolean,
            p_email_alerts := %s::boolean,
            p_public_profile := %s::boolean,
            p_show_location := %s::boolean,
            p_language := %s::varchar,
            p_dark_mode := %s::boolean,
            p_visibility := %s::varchar
        )
        """,
        (
            user_id,
            push_alerts,
            sms_alerts,
            email_alerts,
            public_profile,
            show_location,
            language,
            dark_mode,
            visibility,
        ),
    )


# ---------------------------------------------------------------------------
# Needs / offers
# ---------------------------------------------------------------------------

def fn_search_needs_frontend(
    conn: Connection,
    *,
    radius: float | None,
    query: str | None,
    category: str | None,
    urgency: str | None,
    verified_only: bool,
    sort: str | None,
) -> list[dict[str, Any]]:

    return _fetchall(
        conn,
        """
        SELECT * FROM fn_search_needs_frontend(
            %s::NUMERIC,
            %s::TEXT,
            %s::VARCHAR,
            %s::VARCHAR,
            %s::BOOLEAN,
            %s::VARCHAR
        )
        """,
        (radius, query, category, urgency, verified_only, sort),
    )

def fn_search_offers_frontend(
    conn: Connection,
    *,
    radius: float | None,
    query: str | None,
    category: str | None,
    condition: str | None,
    verified_only: bool,
    sort: str | None,
) -> list[dict[str, Any]]:
    return _fetchall(
        conn,
        """
        SELECT * FROM fn_search_offers_frontend(
            %s::NUMERIC,
            %s::TEXT,
            %s::VARCHAR,
            %s::VARCHAR,
            %s::BOOLEAN,
            %s::VARCHAR
        )
        """,
        (radius, query, category, condition, verified_only, sort),
    )


def fn_get_need_frontend(conn: Connection, need_id: int) -> dict[str, Any] | None:
    row = _fetchone(conn, "SELECT * FROM fn_get_need_frontend(%s::bigint)", (need_id,))
    if row:
        owner = _fetchone(conn, "SELECT user_id FROM needs WHERE need_id = %s::bigint", (need_id,))
        if owner:
            row["owner_user_id"] = owner["user_id"]
    return row


def fn_get_offer_frontend(conn: Connection, offer_id: int) -> dict[str, Any] | None:
    row = _fetchone(conn, "SELECT * FROM fn_get_offer_frontend(%s::bigint)", (offer_id,))
    if row:
        owner = _fetchone(conn, "SELECT user_id FROM offers WHERE offer_id = %s::bigint", (offer_id,))
        if owner:
            row["owner_user_id"] = owner["user_id"]
    return row


def sp_post_need(
    conn: Connection,
    *,
    user_id: int,
    category_name: str,
    title: str,
    description: str,
    urgency: str,
    duration: str | None,
    location: str,
    radius: float | None,
    photo: str | None,
    tags: list[str] | None,
) -> int | None:
    row = _call(
        conn,
        """
        CALL sp_post_need(
            p_user_id := %s::bigint,
            p_category_name := %s::varchar,
            p_title := %s::varchar,
            p_description := %s::text,
            p_urgency := %s::varchar,
            p_duration := %s::varchar,
            p_location := %s::varchar,
            p_radius := %s::numeric,
            p_photo := %s::text,
            p_tags := %s::text[],
            p_need_id := %s::bigint
        )
        """,
        (
            user_id,
            category_name,
            title,
            description,
            urgency,
            duration,
            location,
            radius,
            photo,
            tags,
            None,
        ),
    )
    need_id = _inout_id(row)
    if need_id is not None:
        return need_id
    fallback = _fetchone(
        conn,
        """
        SELECT need_id FROM needs
        WHERE user_id = %s
        ORDER BY created_date DESC
        LIMIT 1
        """,
        (user_id,),
    )
    return int(fallback["need_id"]) if fallback else None


def sp_post_offer(
    conn: Connection,
    *,
    user_id: int,
    category_name: str,
    title: str,
    description: str,
    condition: str,
    availability: str | None,
    pickup_option: str,
    location: str,
    radius: float | None,
    photo: str | None,
    tags: list[str] | None,
) -> int | None:
    row = _call(
        conn,
        """
        CALL sp_post_offer(
            p_user_id := %s::bigint,
            p_category_name := %s::varchar,
            p_title := %s::varchar,
            p_description := %s::text,
            p_condition := %s::varchar,
            p_availability := %s::varchar,
            p_pickup_option := %s::varchar,
            p_location := %s::varchar,
            p_radius := %s::numeric,
            p_photo := %s::text,
            p_tags := %s::text[],
            p_offer_id := %s::bigint
        )
        """,
        (
            user_id,
            category_name,
            title,
            description,
            condition,
            availability,
            pickup_option,
            location,
            radius,
            photo,
            tags,
            None,
        ),
    )
    offer_id = _inout_id(row)
    if offer_id is not None:
        return offer_id
    fallback = _fetchone(
        conn,
        """
        SELECT offer_id FROM offers
        WHERE user_id = %s
        ORDER BY created_date DESC
        LIMIT 1
        """,
        (user_id,),
    )
    return int(fallback["offer_id"]) if fallback else None


def sp_remove_need(conn: Connection, user_id: int, need_id: int) -> None:
    _call(conn, "CALL sp_remove_need(%s::bigint, %s::bigint)", (user_id, need_id))


def sp_remove_offer(conn: Connection, user_id: int, offer_id: int) -> None:
    _call(conn, "CALL sp_remove_offer(%s::bigint, %s::bigint)", (user_id, offer_id))


# ---------------------------------------------------------------------------
# Bookmarks
# ---------------------------------------------------------------------------

def fn_get_bookmarks(conn: Connection, user_id: int) -> list[dict[str, Any]]:
    return _fetchall(conn, "SELECT * FROM fn_get_bookmarks(%s::bigint)", (user_id,))


def fn_toggle_bookmark(conn: Connection, user_id: int, item_id: int, item_type: str) -> bool:
    return bool(_scalar(conn, "SELECT fn_toggle_bookmark(%s::bigint, %s::bigint, %s::varchar)", (user_id, item_id, item_type)))


def fn_is_bookmarked(conn: Connection, user_id: int, item_id: int, item_type: str) -> bool:
    return bool(_scalar(conn, "SELECT fn_is_bookmarked(%s::bigint, %s::bigint, %s::varchar)", (user_id, item_id, item_type)))


# ---------------------------------------------------------------------------
# Responses
# ---------------------------------------------------------------------------

def sp_respond_to_need(
    conn: Connection,
    *,
    need_id: int,
    user_id: int,
    offer_id: int | None,
    message: str | None,
) -> int | None:
    row = _call(
        conn,
        """
        CALL sp_respond_to_need(
            p_need_id := %s::bigint,
            p_user_id := %s::bigint,
            p_offer_id := %s::bigint,
            p_message := %s::text,
            p_response_id := %s::bigint
        )
        """,
        (need_id, user_id, offer_id, message, None),
    )
    return _inout_id(row)


def sp_accept_response(conn: Connection, response_id: int, actor_user_id: int) -> None:
    _call(conn, "CALL sp_accept_response(%s::bigint, %s::bigint)", (response_id, actor_user_id))


def sp_reject_response(conn: Connection, response_id: int, actor_user_id: int) -> None:
    _call(conn, "CALL sp_reject_response(%s::bigint, %s::bigint)", (response_id, actor_user_id))


def sp_mark_exchange_completed(conn: Connection, need_id: int, response_id: int) -> None:
    _call(conn, "CALL sp_mark_exchange_completed(%s::bigint, %s::bigint)", (need_id, response_id))


# ---------------------------------------------------------------------------
# Reviews / ratings
# ---------------------------------------------------------------------------

def fn_get_reviews(conn: Connection, user_id: int) -> list[dict[str, Any]]:
    return _fetchall(conn, "SELECT * FROM fn_get_reviews(%s::bigint)", (user_id,))


def sp_add_rating(conn: Connection, reviewer_id: int, rated_user_id: int, rating_value: int) -> None:
    _call(conn, "CALL sp_add_rating(%s::bigint, %s::bigint, %s::smallint)", (reviewer_id, rated_user_id, rating_value))


def sp_add_review(conn: Connection, reviewer_id: int, reviewed_user_id: int, review_text: str) -> None:
    _call(conn, "CALL sp_add_review(%s::bigint, %s::bigint, %s::text)", (reviewer_id, reviewed_user_id, review_text))


# ---------------------------------------------------------------------------
# Messages
# ---------------------------------------------------------------------------

def fn_get_conversations(conn: Connection, user_id: int) -> list[dict[str, Any]]:
    return _fetchall(conn, "SELECT * FROM fn_get_conversations(%s::bigint)", (user_id,))


def fn_get_or_create_conversation(conn: Connection, user_id: int, other_user_id: int) -> int:
    value = _scalar(conn, "SELECT fn_get_or_create_conversation(%s::bigint, %s::bigint)", (user_id, other_user_id))
    return int(value)


def fn_get_messages(conn: Connection, user_id: int, conversation_id: int) -> list[dict[str, Any]]:
    return _fetchall(
        conn,
        "SELECT * FROM fn_get_messages(%s::bigint, %s::bigint)",
        (user_id, conversation_id),
    )


def fn_send_message(conn: Connection, user_id: int, conversation_id: int, text: str) -> int:
    value = _scalar(conn, "SELECT fn_send_message(%s::bigint, %s::bigint, %s::text)", (user_id, conversation_id, text))
    return int(value)


def sp_mark_conversation_read(conn: Connection, user_id: int, conversation_id: int) -> None:
    _call(conn, "CALL sp_mark_conversation_read(%s::bigint, %s::bigint)", (user_id, conversation_id))


def sp_delete_conversation(conn: Connection, user_id: int, conversation_id: int) -> None:
    _call(conn, "CALL sp_delete_conversation(%s::bigint, %s::bigint)", (user_id, conversation_id))


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

def fn_user_dashboard_stats(conn: Connection, user_id: int) -> dict[str, Any] | None:
    return _fetchone(conn, "SELECT * FROM fn_user_dashboard_stats(%s::bigint)", (user_id,))


def fn_user_activity_history(conn: Connection, user_id: int) -> list[dict[str, Any]]:
    return _fetchall(conn, "SELECT * FROM fn_user_activity_history(%s::bigint)", (user_id,))


def fn_dashboard_nearby_needs(conn: Connection, user_id: int, radius: float | None) -> list[dict[str, Any]]:
    return _fetchall(
        conn,
        "SELECT * FROM fn_dashboard_nearby_needs(%s::bigint, %s::numeric)",
        (user_id, radius),
    )


def fn_dashboard_nearby_offers(conn: Connection, user_id: int, radius: float | None) -> list[dict[str, Any]]:
    return _fetchall(
        conn,
        "SELECT * FROM fn_dashboard_nearby_offers(%s::bigint, %s::numeric)",
        (user_id, radius),
    )


# ---------------------------------------------------------------------------
# Reports / admin
# ---------------------------------------------------------------------------

def sp_report_need(conn: Connection, reporter_id: int, need_id: int, reason: str) -> None:
    _call(conn, "CALL sp_report_need(%s::bigint, %s::bigint, %s::text)", (reporter_id, need_id, reason))


def sp_report_offer(conn: Connection, reporter_id: int, offer_id: int, reason: str) -> None:
    _call(conn, "CALL sp_report_offer(%s::bigint, %s::bigint, %s::text)", (reporter_id, offer_id, reason))


def sp_register_admin(
    conn: Connection,
    *,
    name: str,
    username: str,
    email: str,
    password: str,
) -> int | None:
    row = _call(
        conn,
        """
        CALL sp_register_admin(
            p_name := %s::varchar,
            p_username := %s::varchar,
            p_email := %s::varchar,
            p_password := %s::text,
            p_admin_id := %s::bigint
        )
        """,
        (name, username, email, password, None),
    )
    admin_id = _inout_id(row)
    if admin_id is not None:
        return admin_id
    fallback = _fetchone(
        conn,
        "SELECT admin_id FROM admin WHERE lower(email) = lower(trim(%s))",
        (email,),
    )
    return int(fallback["admin_id"]) if fallback else None


def fn_admin_dashboard_stats(conn: Connection) -> dict[str, Any] | None:
    return _fetchone(conn, "SELECT * FROM fn_admin_dashboard_stats()")


def fn_admin_recent_activity(conn: Connection, limit: int) -> list[dict[str, Any]]:
    return _fetchall(conn, "SELECT * FROM fn_admin_recent_activity(%s::integer)", (limit,))


def sp_admin_remove_post(conn: Connection, post_type: str, post_id: int) -> None:
    _call(conn, "CALL sp_admin_remove_post(%s::varchar, %s::bigint)", (post_type, post_id))


def sp_admin_deactivate_user(conn: Connection, user_id: int) -> None:
    _call(conn, "CALL sp_admin_deactivate_user(%s::bigint)", (user_id,))
