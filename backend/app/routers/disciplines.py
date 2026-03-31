from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import uuid
from app.database import get_db
from app.dependencies.auth import get_current_user_id
from app.schemas.discipline import CustomDisciplineCreate, CustomDisciplineResponse, DisciplineListResponse
from app.models.discipline import CustomDiscipline
from app.models.capital import DefaultDiscipline
from typing import List

router = APIRouter(prefix="/disciplines", tags=["disciplines"])

@router.get("/", response_model=DisciplineListResponse)
async def get_disciplines(
    _user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    # Get default disciplines
    result = await db.execute(select(DefaultDiscipline))
    defaults = result.scalars().all()
    default_list = [{"id": d.id, "capital_id": d.capital_id, "label": d.label, "sort_order": d.sort_order} for d in defaults]

    # Get custom disciplines
    result = await db.execute(
        select(CustomDiscipline).where(CustomDiscipline.user_id == _user_id)
    )
    custom = result.scalars().all()

    return DisciplineListResponse(default=default_list, custom=custom)

@router.post("/custom", response_model=CustomDisciplineResponse)
async def create_custom_discipline(
    discipline: CustomDisciplineCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    new_discipline = CustomDiscipline(
        user_id=user_id,
        capital_id=discipline.capital_id,
        label=discipline.label
    )
    db.add(new_discipline)
    await db.commit()
    await db.refresh(new_discipline)
    return new_discipline

@router.delete("/custom/{discipline_id}")
async def delete_custom_discipline(
    discipline_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CustomDiscipline).where(
            and_(CustomDiscipline.id == discipline_id, CustomDiscipline.user_id == user_id)
        )
    )
    discipline = result.scalar_one_or_none()

    if not discipline:
        raise HTTPException(status_code=404, detail="Custom discipline not found")

    await db.delete(discipline)
    await db.commit()
    return {"status": "deleted"}
