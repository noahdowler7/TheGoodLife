from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime
import uuid
from app.database import get_db
from app.dependencies.auth import get_current_user_id
from app.schemas.sync import SyncPushRequest, SyncPushResponse, SyncPullResponse
from app.services.sync import bulk_import
from app.models.investment import Investment
from app.models.rating import Rating
from app.models.reflection import Reflection
from app.models.event import CalendarEvent
from app.models.fasting import FastingRecord
from app.models.partner import AccountabilityPartner
from app.models.discipline import CustomDiscipline
from app.models.user import UserSettings

router = APIRouter(prefix="/sync", tags=["sync"])

@router.post("/push", response_model=SyncPushResponse)
async def sync_push(
    data: SyncPushRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    counts = await bulk_import(db, user_id, data.dict())
    return SyncPushResponse(status="ok", counts=counts)

@router.get("/pull", response_model=SyncPullResponse)
async def sync_pull(
    since: str = Query(None, description="ISO timestamp to sync from"),
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    # TODO: Filter by timestamp when `since` is provided

    # Get all user data
    disciplines_dict = {}
    result = await db.execute(
        select(Investment).where(Investment.user_id == user_id)
    )
    for inv in result.scalars().all():
        date_str = inv.date.strftime("%Y-%m-%d")
        if date_str not in disciplines_dict:
            disciplines_dict[date_str] = {}
        disciplines_dict[date_str][inv.discipline_id] = inv.completed

    ratings_dict = {}
    result = await db.execute(
        select(Rating).where(Rating.user_id == user_id)
    )
    for rating in result.scalars().all():
        date_str = rating.date.strftime("%Y-%m-%d")
        if date_str not in ratings_dict:
            ratings_dict[date_str] = {}
        ratings_dict[date_str][rating.capital_id] = rating.score

    reflections_dict = {}
    result = await db.execute(
        select(Reflection).where(Reflection.user_id == user_id)
    )
    for refl in result.scalars().all():
        date_str = refl.date.strftime("%Y-%m-%d")
        if date_str not in reflections_dict:
            reflections_dict[date_str] = {}
        key = refl.capital_id if refl.capital_id else "devotional"
        reflections_dict[date_str][key] = refl.content

    # Events
    result = await db.execute(
        select(CalendarEvent).where(CalendarEvent.user_id == user_id)
    )
    events_list = [
        {
            "id": str(e.id),
            "date": e.date.strftime("%Y-%m-%d"),
            "title": e.title,
            "type": e.event_type,
            "time": e.time.strftime("%H:%M:%S") if e.time else None,
            "notes": e.notes
        }
        for e in result.scalars().all()
    ]

    # Fasting
    result = await db.execute(
        select(FastingRecord).where(FastingRecord.user_id == user_id)
    )
    fasting_list = [
        {
            "id": str(f.id),
            "date": f.date.strftime("%Y-%m-%d"),
            "type": f.fast_type,
            "startTime": f.start_time.isoformat() if f.start_time else None,
            "endTime": f.end_time.isoformat() if f.end_time else None,
            "notes": f.notes,
            "completed": f.completed
        }
        for f in result.scalars().all()
    ]

    # Partners
    result = await db.execute(
        select(AccountabilityPartner).where(AccountabilityPartner.user_id == user_id)
    )
    partners_list = [
        {
            "id": str(p.id),
            "name": p.name,
            "color": p.color,
            "createdAt": p.created_at.isoformat()
        }
        for p in result.scalars().all()
    ]

    # Custom disciplines
    result = await db.execute(
        select(CustomDiscipline).where(CustomDiscipline.user_id == user_id)
    )
    custom_disc_list = [
        {
            "id": str(d.id),
            "label": d.label,
            "capitalId": d.capital_id
        }
        for d in result.scalars().all()
    ]

    # Settings
    result = await db.execute(
        select(UserSettings).where(UserSettings.user_id == user_id)
    )
    settings_obj = result.scalar_one_or_none()
    settings_dict = {
        "theme": settings_obj.theme if settings_obj else "dark",
        "capitals": settings_obj.enabled_capitals if settings_obj else {},
        "onboardingComplete": settings_obj.onboarding_complete if settings_obj else False,
        "introGuideComplete": settings_obj.intro_guide_seen if settings_obj else False
    }

    return SyncPullResponse(
        disciplines=disciplines_dict,
        ratings=ratings_dict,
        reflections=reflections_dict,
        events=events_list,
        fasting=fasting_list,
        partners=partners_list,
        custom_disciplines=custom_disc_list,
        settings=settings_dict
    )
