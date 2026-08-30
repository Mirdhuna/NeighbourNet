from __future__ import annotations
class ProcedureError(Exception):
    """Raised when PostgreSQL RAISE EXCEPTION is returned from a routine."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)
