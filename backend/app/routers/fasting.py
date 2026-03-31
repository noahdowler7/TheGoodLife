from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import uuid
from app.database import get_db
from app.dependencies.auth import get_current_user_id
from app.schemas.fasting import FastingCreate, FastingUpdate, FastingResponse
from app.models.fasting import FastingRecord
from typing import List

router = APIRouter(prefix="/fasting", tags=["fasting"])

@router.get("/", response_model=List[FastingResponse])
async def get_fasting_records(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(FastingRecord).where(FastingRecord.user_id == user_id).order_by(FastingRecord.date.desc())
    )
    return result.scalars().all()

@router.post("/", response_model=FastingResponse)
async def create_fasting_record(
    fasting: FastingCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    new_record = FastingRecord(
        user_id=user_id,
        date=fasting.date,
        fast_type=fasting.fast_type,
        start_time=fasting.start_time,
        end_time=fasting.end_time,
        notes=fasting.notes
    )
    db.add(new_record)
    await db.commit()
    await db.refresh(new_record)
    return new_record

@router.put("/{fasting_id}", response_model=FastingResponse)
async def update_fasting_record(
    fasting_id: uuid.UUID,
    fasting_update: FastingUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(FastingRecord).where(
            and_(FastingRecord.id == fasting_id, FastingRecord.user_id == user_id)
        )
    )
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="Fasting record not found")

    if fasting_update.fast_type is not None:
        record.fast_type = fasting_update.fast_type
    if fasting_update.start_time is not None:
        record.start_time = fasting_update.start_time
    if fasting_update.end_time is not None:
        record.end_time = fasting_update.end_time
    if fasting_update.notes is not None:
        record.notes = fasting_update.notes
    if fasting_update.completed is not None:
        record.completed = fasting_update.completed

    await db.commit()
    await db.refresh(record)
    return record
