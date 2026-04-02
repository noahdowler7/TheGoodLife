from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import engine
from app.routers import (
    auth,
    users,
    investments,
    ratings,
    reflections,
    fasting,
    disciplines,
    events,
    analytics,
    sync,
    partners
)

@asynccontextmanager
async def lifespan(app):
    yield
    await engine.dispose()

app = FastAPI(lifespan=lifespan)

_origins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"]
if settings.frontend_url not in _origins:
    _origins.append(settings.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(investments.router, prefix="/api/v1")
app.include_router(ratings.router, prefix="/api/v1")
app.include_router(reflections.router, prefix="/api/v1")
app.include_router(fasting.router, prefix="/api/v1")
app.include_router(disciplines.router, prefix="/api/v1")
app.include_router(events.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(sync.router, prefix="/api/v1")
app.include_router(partners.router, prefix="/api/v1")

@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok"}
