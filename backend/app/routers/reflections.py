from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import date as date_type
import uuid
from app.database import get_db
from app.dependencies.auth import get_current_user_id
from app.schemas.reflection import ReflectionUpdate, ReflectionResponse
from app.models.reflection import Reflection

router = APIRouter(prefix="/reflections", tags=["reflections"])

@router.get("/{date}", response_model=ReflectionResponse)
async def get_reflections(
    date: date_type,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Reflection).where(
            and_(Reflection.user_id == user_id, Reflection.date == date)
        )
    )
    reflections_list = result.scalars().all()

    reflections_dict = {}
    for r in reflections_list:
        key = r.capital_id if r.capital_id else "devotional"
        reflections_dict[key] = r.content

    return ReflectionResponse(date=date, reflections=reflections_dict)

@router.put("/{date}", response_model=ReflectionResponse)
async def update_reflections(
    date: date_type,
    reflection_update: ReflectionUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    for key, content in reflection_update.reflections.items():
        capital_id = None if key == "devotional" else key
        reflection_type = "devotional" if key == "devotional" else "capital"

        result = await db.execute(
            select(Reflection).where(
                and_(
                    Reflection.user_id == user_id,
                    Reflection.date == date,
                    Reflection.capital_id == capital_id,
                    Reflection.type == reflection_type
                )
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.content = content
        else:
            new_reflection = Reflection(
                user_id=user_id,
                date=date,
                capital_id=capital_id,
                type=reflection_type,
                content=content
            )
            db.add(new_reflection)

    await db.commit()

    # Return updated
    result = await db.execute(
        select(Reflection).where(
            and_(Reflection.user_id == user_id, Reflection.date == date)
        )
    )
    reflections_list = result.scalars().all()
    reflections_dict = {}
    for r in reflections_list:
        key = r.capital_id if r.capital_id else "devotional"
        reflections_dict[key] = r.content

    return ReflectionResponse(date=date, reflections=reflections_dict)
