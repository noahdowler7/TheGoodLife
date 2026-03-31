from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from datetime import date, timedelta
import uuid
from app.models.investment import Investment
from typing import Dict

async def calculate_capital_streaks(db: AsyncSession, user_id: uuid.UUID) -> Dict[str, int]:
    """Calculate current streak for each capital (consecutive days with at least 1 investment)"""
    streaks = {}
    capitals = ["spiritual", "relational", "physical", "intellectual", "financial"]
    today = date.today()

    for capital in capitals:
        streak = 0
        check_date = today

        while True:
            result = await db.execute(
                select(func.count(Investment.id)).where(
                    and_(
                        Investment.user_id == user_id,
                        Investment.capital_id == capital,
                        Investment.date == check_date,
                        Investment.completed == True
                    )
                )
            )
            count = result.scalar()

            if count > 0:
                streak += 1
                check_date -= timedelta(days=1)
            else:
                break

        streaks[capital] = streak

    return streaks
