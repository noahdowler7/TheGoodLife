from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx
from app.database import get_db
from app.schemas.auth import MagicLinkRequest, VerifyTokenRequest, TokenResponse
from app.services.auth import create_magic_token, verify_magic_token, create_access_token
from app.models.user import User, UserSettings
from app.config import settings as app_settings

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

    if app_settings.resend_api_key:
        link = f"{app_settings.app_url}/auth/verify?token={token}"
        html = f"""
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; background: #0A0A0A; color: #FAFAF8; padding: 40px; border-radius: 16px;">
            <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px;">The Good Life</h1>
            <p style="color: #888; margin: 0 0 32px;">Your spiritual operating system</p>
            <p style="margin: 0 0 24px;">Click the button below to sign in. This link expires in 15 minutes.</p>
            <a href="{link}" style="display: inline-block; padding: 14px 28px; background: #D4A843; color: #0A0A0A; text-decoration: none; border-radius: 10px; font-weight: 600;">Sign In to The Good Life</a>
            <p style="margin: 32px 0 0; color: #555; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
        """
        async with httpx.AsyncClient() as client:
            await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {app_settings.resend_api_key}"},
                json={"from": app_settings.from_email, "to": [request.email], "subject": "Sign in to The Good Life", "html": html},
                timeout=10,
            )
        return {"message": "Check your email for a sign-in link"}
    else:
        # Dev fallback: return token directly
        return {"token": token, "message": "Dev mode: email sending not configured"}

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
