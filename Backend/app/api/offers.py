from fastapi import APIRouter, HTTPException, Query, status

from app.core.deps import CurrentUser, DbConn
from app.db import procedures
from app.schemas.auth import MessageResponse
from app.schemas.offers import OfferCreate, OfferCreated, OfferOut
from app.services import map_offer

router = APIRouter()


@router.get("/mine", response_model=list[OfferOut])
def my_offers(conn: DbConn, user: CurrentUser):
    rows = procedures.list_my_offers(conn, int(user["user_id"]))
    return [map_offer(row) for row in rows]


@router.get("", response_model=list[OfferOut])
def search_offers(
    conn: DbConn,
    _user: CurrentUser,
    q: str | None = Query(default=None),
    category: str | None = Query(default="All"),
    condition: str | None = Query(default="All"),
    verified_only: bool = Query(default=False),
    radius: float = Query(default=5),
    sort: str = Query(default="latest"),
):
    rows = procedures.fn_search_offers_frontend(
        conn,
        radius=radius,
        query=q,
        category=category,
        condition=condition,
        verified_only=verified_only,
        sort=sort,
    )
    return [map_offer(row) for row in rows]


@router.get("/{offer_id}", response_model=OfferOut)
def get_offer(offer_id: int, conn: DbConn, _user: CurrentUser):
    row = procedures.fn_get_offer_frontend(conn, offer_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")
    return map_offer(row)


@router.post("", response_model=OfferCreated, status_code=status.HTTP_201_CREATED)
def create_offer(body: OfferCreate, conn: DbConn, user: CurrentUser):
    offer_id = procedures.sp_post_offer(
        conn,
        user_id=int(user["user_id"]),
        category_name=body.category,
        title=body.title,
        description=body.description,
        condition=body.condition,
        availability=body.availability,
        pickup_option=body.pickupOption,
        location=body.location,
        radius=body.radius,
        photo=body.photo,
        tags=body.tags,
    )
    if offer_id is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Offer was not created")
    return OfferCreated(id=offer_id)


@router.delete("/{offer_id}", response_model=MessageResponse)
def delete_offer(offer_id: int, conn: DbConn, user: CurrentUser):
    procedures.sp_remove_offer(conn, int(user["user_id"]), offer_id)
    return MessageResponse(detail="Offer removed")
