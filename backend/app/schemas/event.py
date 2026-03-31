from pydantic import BaseModel
from datetime import date, time
from typing import Optional
import uuid

class EventCreate(BaseModel):
    date: date
    title: str
    event_type: str
    time: Optional[time] = None
    notes: Optional[str] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    event_type: Optional[str] = None
    time: Optional[time] = None
    notes: Optional[str] = None

class EventResponse(BaseModel):
    id: uuid.UUID
    date: date
    title: str
    event_type: str
    time: Optional[time] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True
