from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import (
    admin,
    auth,
    bookmarks,
    categories,
    dashboard,
    messages,
    needs,
    offers,
    profile,
    reports,
    responses,
    reviews,
    settings as settings_api,
)
from app.core.config import get_settings
from app.db.exceptions import ProcedureError
from app.db.session import close_pool, init_pool


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_pool()
    yield
    close_pool()


app = FastAPI(
    title="NeighbourNet API",
    version="1.0.0",
    description="FastAPI backend over the existing NeighborNet PostgreSQL schema.",
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ProcedureError)
async def procedure_error_handler(_request: Request, exc: ProcedureError):
    return JSONResponse(status_code=400, content={"detail": exc.message})


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(settings_api.router, prefix="/api", tags=["settings"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(needs.router, prefix="/api/needs", tags=["needs"])
app.include_router(offers.router, prefix="/api/offers", tags=["offers"])
app.include_router(bookmarks.router, prefix="/api/bookmarks", tags=["bookmarks"])
app.include_router(messages.router, prefix="/api/conversations", tags=["messages"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(reports.router, prefix="/api", tags=["reports"])
app.include_router(responses.router, prefix="/api", tags=["responses"])
app.include_router(reviews.router, prefix="/api", tags=["reviews"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
