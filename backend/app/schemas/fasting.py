from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
import uuid

class FastingCreate(BaseModel):
    date: date
    fast_type: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    notes: Optional[str] = None

class FastingUpdate(BaseModel):
    fast_type: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    notes: Optional[str] = None
    completed: Optional[bool] = None

class FastingResponse(BaseModel):
    id: uuid.UUID
    date: date
    fast_type: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    notes: Optional[str] = None
    completed: bool

    class Config:
        from_attributes = True
