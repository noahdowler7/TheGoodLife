from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.schemas.auth import MagicLinkRequest, VerifyTokenRequest, TokenResponse
from app.services.auth import create_magic_token, verify_magic_token, create_access_token
from app.models.user import User, UserSettings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/magic-link", response_model=dict)
async def request_magic_link(
    request: MagicLinkRequest,
    db: AsyncSession = Depends(get_db)
):
    # Check if user exists, create if not
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(email=request.email)
        db.add(user)
        await db.flush()  # Flush to get user.id
        await db.refresh(user)  # Refresh to ensure user.id is populated

        # Create default settings
        settings = UserSettings(user_id=user.id)
        db.add(settings)

        await db.commit()
        await db.refresh(user)

    token = create_magic_token(request.email)

    # TODO: Send email with magic link
    # For now, return token directly
    return {"token": token, "message": "Magic link generated (email sending not implemented)"}

@router.post("/verify", response_model=TokenResponse)
async def verify_magic_link(
    request: VerifyTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    token = request.token
    try:
        email = verify_magic_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    access_token = create_access_token(user.id)

    return TokenResponse(access_token=access_token)
