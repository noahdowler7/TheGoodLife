from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import date
import uuid
from app.database import get_db
from app.dependencies.auth import get_current_user_id
from app.schemas.investment import InvestmentCreate, InvestmentResponse
from app.models.investment import Investment
from typing import List

router = APIRouter(prefix="/investments", tags=["investments"])

@router.get("/today", response_model=List[InvestmentResponse])
async def get_today_investments(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    today = date.today()
    result = await db.execute(
        select(Investment).where(
            and_(Investment.user_id == user_id, Investment.date == today)
        )
    )
    return result.scalars().all()

@router.post("/", response_model=InvestmentResponse)
async def create_investment(
    investment: InvestmentCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    # Upsert logic
    result = await db.execute(
        select(Investment).where(
            and_(
                Investment.user_id == user_id,
                Investment.date == investment.date,
                Investment.discipline_id == investment.discipline_id
            )
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.completed = investment.completed
        existing.capital_id = investment.capital_id
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        new_investment = Investment(
            user_id=user_id,
            date=investment.date,
            discipline_id=investment.discipline_id,
            capital_id=investment.capital_id,
            completed=investment.completed
        )
        db.add(new_investment)
        await db.commit()
        await db.refresh(new_investment)
        return new_investment

@router.delete("/{investment_id}")
async def delete_investment(
    investment_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Investment).where(
            and_(Investment.id == investment_id, Investment.user_id == user_id)
        )
    )
    investment = result.scalar_one_or_none()

    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")

    await db.delete(investment)
    await db.commit()
    return {"status": "deleted"}
