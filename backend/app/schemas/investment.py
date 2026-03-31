from pydantic import BaseModel
from datetime import date
from typing import Optional
import uuid

class InvestmentCreate(BaseModel):
    date: date
    discipline_id: str
    capital_id: str
    completed: bool = False

class InvestmentResponse(BaseModel):
    id: uuid.UUID
    date: date
    discipline_id: str
    capital_id: str
    completed: bool

    class Config:
        from_attributes = True
