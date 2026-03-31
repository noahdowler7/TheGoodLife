from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from app.database import get_db
from app.dependencies.auth import get_current_user_id
from app.schemas.user import UserProfile, UserResponse
from app.services.user import get_user_by_id, update_user_profile

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    profile: UserProfile,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    user = await update_user_profile(
        db, user_id,
        display_name=profile.display_name,
        profile_photo_url=profile.profile_photo_url
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
