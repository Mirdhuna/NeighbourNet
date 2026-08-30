from fastapi import APIRouter, status

from app.core.deps import CurrentUser, DbConn
from app.db import procedures
from app.schemas.reviews import RatingCreate, ReviewCreate, ReviewOut, StatusMessage
from app.services import to_int

router = APIRouter()


@router.get("/users/{user_id}/reviews", response_model=list[ReviewOut])
def get_reviews(user_id: int, conn: DbConn, _user: CurrentUser):
    rows = procedures.fn_get_reviews(conn, user_id)
    return [
        ReviewOut(
            reviewer_name=row.get("reviewer_name"),
            rating=to_int(row.get("rating")),
            review_text=row.get("review_text"),
            created_date=row.get("created_date"),
        )
        for row in rows
    ]


@router.post("/users/{user_id}/ratings", response_model=StatusMessage, status_code=status.HTTP_201_CREATED)
def add_rating(user_id: int, body: RatingCreate, conn: DbConn, user: CurrentUser):
    procedures.sp_add_rating(conn, int(user["user_id"]), user_id, body.rating_value)
    return StatusMessage(detail="Rating saved")


@router.post("/users/{user_id}/reviews", response_model=StatusMessage, status_code=status.HTTP_201_CREATED)
def add_review(user_id: int, body: ReviewCreate, conn: DbConn, user: CurrentUser):
    procedures.sp_add_review(conn, int(user["user_id"]), user_id, body.review_text)
    return StatusMessage(detail="Review saved")
