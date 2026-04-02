from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class PartnerRequest(BaseModel):
    partner_user_id: UUID  # who to send request to
    message: Optional[str] = None


class PartnerResponse(BaseModel):
    id: UUID
    user_id: UUID
    partner_user_id: UUID
    requester_id: UUID
    name: str
    status: str
    message: Optional[str] = None
    color: Optional[str] = None
    created_at: datetime
    responded_at: Optional[datetime] = None
    # Enriched fields (joined)
    partner_display_name: Optional[str] = None
    partner_email: Optional[str] = None
    partner_photo: Optional[str] = None

    class Config:
        from_attributes = True


class UserSearchResult(BaseModel):
    id: UUID
    display_name: Optional[str] = None
    email: str
    profile_photo_url: Optional[str] = None

    class Config:
        from_attributes = True


class PartnerSummary(BaseModel):
    partner_name: str
    alignment_score: Optional[int] = None  # 0-100
    current_streak: int
    weekly_completion: dict  # { capitalId: percentage }
    recent_ratings: list  # last 7 days of capital ratings
    active_capitals: list[str]
