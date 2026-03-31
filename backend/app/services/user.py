from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
import uuid

async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

async def update_user_profile(db: AsyncSession, user_id: uuid.UUID, display_name: str = None, profile_photo_url: str = None) -> User:
    user = await get_user_by_id(db, user_id)
    if not user:
        return None

    if display_name is not None:
        user.display_name = display_name
    if profile_photo_url is not None:
        user.profile_photo_url = profile_photo_url

    await db.commit()
    await db.refresh(user)
    return user
