from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from datetime import date, timedelta
import uuid
from app.models.investment import Investment
from app.models.rating import Rating
from typing import List, Dict

CAPITAL_PRIORITY = {
    "spiritual": 1,
    "relational": 2,
    "physical": 3,
    "intellectual": 4,
    "financial": 5
}

async def detect_patterns(db: AsyncSession, user_id: uuid.UUID) -> List[Dict]:
    insights = []
    today = date.today()
    week_ago = today - timedelta(days=7)

    # Pattern 1: Capital drops on specific day
    result = await db.execute(
        select(
            func.extract('dow', Investment.date).label('day_of_week'),
            Investment.capital_id,
            func.count(Investment.id).label('count')
        ).where(
            and_(
                Investment.user_id == user_id,
                Investment.date >= week_ago,
                Investment.completed == True
            )
        ).group_by('day_of_week', Investment.capital_id)
    )
    day_patterns = result.all()

    # Pattern 2: Priority inversion (lower priority > higher priority)
    result = await db.execute(
        select(
            Investment.capital_id,
            func.count(Investment.id).label('count')
        ).where(
            and_(
                Investment.user_id == user_id,
                Investment.date >= week_ago,
                Investment.completed == True
            )
        ).group_by(Investment.capital_id)
    )
    capital_counts = {row.capital_id: row.count for row in result.all()}

    for cap1, count1 in capital_counts.items():
        for cap2, count2 in capital_counts.items():
            if CAPITAL_PRIORITY[cap1] > CAPITAL_PRIORITY[cap2] and count1 > count2:
                insights.append({
                    "type": "priority_inversion",
                    "message": f"You've invested more in {cap1.title()} than {cap2.title()} this week",
                    "severity": "warning"
                })

    # Pattern 3: No reflections
    result = await db.execute(
        select(Rating).where(
            and_(
                Rating.user_id == user_id,
                Rating.date >= week_ago
            )
        )
    )
    rating_count = len(result.scalars().all())

    if rating_count == 0:
        insights.append({
            "type": "no_reflections",
            "message": "You haven't rated any capitals this week",
            "severity": "info"
        })

    return insights
