from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import uuid
from app.database import get_db
from app.dependencies.auth import get_current_user_id
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.models.event import CalendarEvent
from typing import List

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/", response_model=List[EventResponse])
async def get_events(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CalendarEvent).where(CalendarEvent.user_id == user_id).order_by(CalendarEvent.date)
    )
    return result.scalars().all()

@router.post("/", response_model=EventResponse)
async def create_event(
    event: EventCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    new_event = CalendarEvent(
        user_id=user_id,
        date=event.date,
        title=event.title,
        event_type=event.event_type,
        time=event.time,
        notes=event.notes
    )
    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)
    return new_event

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: uuid.UUID,
    event_update: EventUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CalendarEvent).where(
            and_(CalendarEvent.id == event_id, CalendarEvent.user_id == user_id)
        )
    )
    event = result.scalar_one_or_none()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event_update.title is not None:
        event.title = event_update.title
    if event_update.event_type is not None:
        event.event_type = event_update.event_type
    if event_update.time is not None:
        event.time = event_update.time
    if event_update.notes is not None:
        event.notes = event_update.notes

    await db.commit()
    await db.refresh(event)
    return event

@router.delete("/{event_id}")
async def delete_event(
    event_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CalendarEvent).where(
            and_(CalendarEvent.id == event_id, CalendarEvent.user_id == user_id)
        )
    )
    event = result.scalar_one_or_none()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    await db.delete(event)
    await db.commit()
    return {"status": "deleted"}
