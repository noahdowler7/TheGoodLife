from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import date as date_type
import uuid
from app.database import get_db
from app.dependencies.auth import get_current_user_id
from app.schemas.rating import RatingUpdate, RatingResponse
from app.models.rating import Rating

router = APIRouter(prefix="/ratings", tags=["ratings"])

@router.get("/{date}", response_model=RatingResponse)
async def get_ratings(
    date: date_type,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Rating).where(
            and_(Rating.user_id == user_id, Rating.date == date)
        )
    )
    ratings_list = result.scalars().all()

    ratings_dict = {r.capital_id: r.score for r in ratings_list}
    return RatingResponse(date=date, ratings=ratings_dict)

@router.put("/{date}", response_model=RatingResponse)
async def update_ratings(
    date: date_type,
    rating_update: RatingUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    for capital_id, score in rating_update.ratings.items():
        result = await db.execute(
            select(Rating).where(
                and_(
                    Rating.user_id == user_id,
                    Rating.date == date,
                    Rating.capital_id == capital_id
                )
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.score = score
        else:
            new_rating = Rating(
                user_id=user_id,
                date=date,
                capital_id=capital_id,
                score=score
            )
            db.add(new_rating)

    await db.commit()

    # Return updated ratings
    result = await db.execute(
        select(Rating).where(
            and_(Rating.user_id == user_id, Rating.date == date)
        )
    )
    ratings_list = result.scalars().all()
    ratings_dict = {r.capital_id: r.score for r in ratings_list}

    return RatingResponse(date=date, ratings=ratings_dict)
