from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, Integer
from datetime import date, timedelta
import uuid
from app.models.investment import Investment
from typing import Dict

CAPITAL_WEIGHTS = {
    "spiritual": 5,
    "relational": 4,
    "physical": 3,
    "intellectual": 2,
    "financial": 1
}

async def calculate_alignment_score(db: AsyncSession, user_id: uuid.UUID, days: int = 7) -> Dict:
    """
    Calculate alignment score based on weighted completion
    Higher score = better aligned to priority order
    """
    today = date.today()
    start_date = today - timedelta(days=days)

    result = await db.execute(
        select(
            Investment.capital_id,
            func.count(Investment.id).label('total'),
            func.sum(func.cast(Investment.completed, Integer)).label('completed')
        ).where(
            and_(
                Investment.user_id == user_id,
                Investment.date >= start_date
            )
        ).group_by(Investment.capital_id)
    )

    capital_stats = {row.capital_id: {"total": row.total, "completed": row.completed or 0} for row in result.all()}

    # Calculate weighted completion
    weighted_sum = 0
    max_weighted_sum = 0

    for capital, weight in CAPITAL_WEIGHTS.items():
        if capital in capital_stats:
            completed = capital_stats[capital]["completed"]
            total = capital_stats[capital]["total"]
            weighted_sum += completed * weight
            max_weighted_sum += total * weight

    score = (weighted_sum / max_weighted_sum * 100) if max_weighted_sum > 0 else 0

    return {
        "score": round(score, 1),
        "period_days": days,
        "interpretation": get_score_interpretation(score)
    }

def get_score_interpretation(score: float) -> str:
    if score >= 80:
        return "Excellent alignment with priority order"
    elif score >= 60:
        return "Good alignment, some room for growth"
    elif score >= 40:
        return "Moderate alignment, consider prioritizing higher capitals"
    else:
        return "Low alignment, focus on Spiritual and Relational capitals"
