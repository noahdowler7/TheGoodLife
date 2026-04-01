from pydantic import BaseModel, field_serializer
from typing import Optional
from uuid import UUID

class UserProfile(BaseModel):
    display_name: Optional[str] = None
    profile_photo_url: Optional[str] = None

class UserResponse(BaseModel):
    id: UUID
    email: str
    display_name: Optional[str] = None
    profile_photo_url: Optional[str] = None

    @field_serializer('id')
    def serialize_id(self, value: UUID) -> str:
        return str(value)

    class Config:
        from_attributes = True
