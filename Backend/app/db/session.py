from __future__ import annotations
from collections.abc import Generator

from fastapi import HTTPException, status
from psycopg import Connection
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from app.core.config import get_settings

pool: ConnectionPool | None = None


def init_pool() -> None:
    global pool
    settings = get_settings()
    pool = ConnectionPool(
        conninfo=settings.database_url,
        min_size=1,
        max_size=10,
        kwargs={"row_factory": dict_row, "autocommit": False},
        open=True,
    )


def close_pool() -> None:
    global pool
    if pool is not None:
        pool.close()
        pool = None


def get_connection() -> Generator[Connection, None, None]:
    if pool is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database pool is not initialized",
        )
    with pool.connection() as conn:
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
