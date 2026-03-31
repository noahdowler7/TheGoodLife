from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from datetime import date, timedelta
import uuid
from app.database import get_db
from app.dependencies.auth import get_current_user_id
from app.schemas.analytics import WeeklySummary, TrendsResponse, InsightItem, AlignmentScore
from app.models.investment import Investment
from app.models.rating import Rating
from app.services import insights, streaks, alignment

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/weekly", response_model=WeeklySummary)
async def get_weekly_summary(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    today = date.today()
    week_start = today - timedelta(days=6)

    # Completion by capital
    result = await db.execute(
        select(
            Investment.capital_id,
            func.count(Investment.id).label('total'),
            func.sum(func.cast(Investment.completed, func.Integer())).label('completed')
        ).where(
            and_(
                Investment.user_id == user_id,
                Investment.date >= week_start,
                Investment.date <= today
            )
        ).group_by(Investment.capital_id)
    )

    completion_by_capital = {}
    for row in result.all():
        completion_rate = (row.completed / row.total * 100) if row.total > 0 else 0
        completion_by_capital[row.capital_id] = round(completion_rate, 1)

    # Average ratings by capital
    result = await db.execute(
        select(
            Rating.capital_id,
            func.avg(Rating.score).label('avg_score')
        ).where(
            and_(
                Rating.user_id == user_id,
                Rating.date >= week_start,
                Rating.date <= today
            )
        ).group_by(Rating.capital_id)
    )

    avg_ratings_by_capital = {}
    for row in result.all():
        avg_ratings_by_capital[row.capital_id] = round(row.avg_score, 1)

    return WeeklySummary(
        week_start=week_start.strftime("%Y-%m-%d"),
        week_end=today.strftime("%Y-%m-%d"),
        completion_by_capital=completion_by_capital,
        avg_ratings_by_capital=avg_ratings_by_capital
    )

@router.get("/trends", response_model=TrendsResponse)
async def get_trends(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    insights_data = await insights.detect_patterns(db, user_id)
    streaks_data = await streaks.calculate_capital_streaks(db, user_id)
    alignment_data = await alignment.calculate_alignment_score(db, user_id, days=7)

    return TrendsResponse(
        insights=[InsightItem(**item) for item in insights_data],
        streaks=streaks_data,
        alignment=AlignmentScore(**alignment_data)
    )
