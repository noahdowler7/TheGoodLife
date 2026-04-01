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
    # Parse since parameter for incremental sync
    since_datetime = None
    if since:
        try:
            since_datetime = datetime.fromisoformat(since.replace('Z', '+00:00'))
        except ValueError:
            pass  # Invalid timestamp, ignore and do full sync

    # Get all user data (with optional timestamp filter)
    disciplines_dict = {}
    query = select(Investment).where(Investment.user_id == user_id)
    if since_datetime:
        query = query.where(Investment.updated_at >= since_datetime)
    result = await db.execute(query)
    for inv in result.scalars().all():
        date_str = inv.date.strftime("%Y-%m-%d")
        if date_str not in disciplines_dict:
            disciplines_dict[date_str] = {}
        disciplines_dict[date_str][inv.discipline_id] = inv.completed

    ratings_dict = {}
    query = select(Rating).where(Rating.user_id == user_id)
    if since_datetime:
        query = query.where(Rating.updated_at >= since_datetime)
    result = await db.execute(query)
    for rating in result.scalars().all():
        date_str = rating.date.strftime("%Y-%m-%d")
        if date_str not in ratings_dict:
            ratings_dict[date_str] = {}
        ratings_dict[date_str][rating.capital_id] = rating.score

    reflections_dict = {}
    query = select(Reflection).where(Reflection.user_id == user_id)
    if since_datetime:
        query = query.where(Reflection.updated_at >= since_datetime)
    result = await db.execute(query)
    for refl in result.scalars().all():
        date_str = refl.date.strftime("%Y-%m-%d")
        if date_str not in reflections_dict:
            reflections_dict[date_str] = {}
        key = refl.capital_id if refl.capital_id else "devotional"
        reflections_dict[date_str][key] = refl.content

    # Events
    query = select(CalendarEvent).where(CalendarEvent.user_id == user_id)
    if since_datetime:
        query = query.where(CalendarEvent.updated_at >= since_datetime)
    result = await db.execute(query)
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
    query = select(FastingRecord).where(FastingRecord.user_id == user_id)
    if since_datetime:
        query = query.where(FastingRecord.updated_at >= since_datetime)
    result = await db.execute(query)
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
    query = select(AccountabilityPartner).where(AccountabilityPartner.user_id == user_id)
    if since_datetime:
        query = query.where(AccountabilityPartner.updated_at >= since_datetime)
    result = await db.execute(query)
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
    query = select(CustomDiscipline).where(CustomDiscipline.user_id == user_id)
    if since_datetime:
        query = query.where(CustomDiscipline.updated_at >= since_datetime)
    result = await db.execute(query)
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
