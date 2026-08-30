from fastapi import APIRouter, Query

from app.core.deps import CurrentUser, DbConn
from app.db import procedures
from app.schemas.dashboard import ActivityOut, DashboardStatsOut, NearbyNeedOut, NearbyOfferOut
from app.services import to_float, to_int

router = APIRouter()


@router.get("/stats", response_model=DashboardStatsOut)
def dashboard_stats(conn: DbConn, user: CurrentUser):
    row = procedures.fn_user_dashboard_stats(conn, int(user["user_id"])) or {}
    return DashboardStatsOut(
        total_needs=to_int(row.get("total_needs")) or 0,
        total_offers=to_int(row.get("total_offers")) or 0,
        total_responses=to_int(row.get("total_responses")) or 0,
        total_completed=to_int(row.get("total_completed")) or 0,
        average_rating=to_float(row.get("average_rating")),
        trust_score=to_float(row.get("trust_score")),
    )


@router.get("/activity", response_model=list[ActivityOut])
def dashboard_activity(conn: DbConn, user: CurrentUser):
    return procedures.fn_user_activity_history(conn, int(user["user_id"]))


@router.get("/nearby-needs", response_model=list[NearbyNeedOut])
def nearby_needs(
    conn: DbConn,
    user: CurrentUser,
    radius: float = Query(default=5),
):
    rows = procedures.fn_dashboard_nearby_needs(conn, int(user["user_id"]), radius)
    return [
        NearbyNeedOut(
            id=int(row["id"]),
            title=row["title"],
            owner=row.get("owner"),
            distance=to_float(row.get("distance")),
            location=row.get("location"),
            urgency=row.get("urgency"),
        )
        for row in rows
    ]


@router.get("/nearby-offers", response_model=list[NearbyOfferOut])
def nearby_offers(
    conn: DbConn,
    user: CurrentUser,
    radius: float = Query(default=5),
):
    rows = procedures.fn_dashboard_nearby_offers(conn, int(user["user_id"]), radius)
    return [
        NearbyOfferOut(
            id=int(row["id"]),
            title=row["title"],
            owner=row.get("owner"),
            distance=to_float(row.get("distance")),
            location=row.get("location"),
            type=row.get("type"),
        )
        for row in rows
    ]
