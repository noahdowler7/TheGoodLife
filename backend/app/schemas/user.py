from pydantic import BaseModel
from typing import Optional

class UserProfile(BaseModel):
    display_name: Optional[str] = None
    profile_photo_url: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    display_name: Optional[str] = None
    profile_photo_url: Optional[str] = None

    class Config:
        from_attributes = True
