from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from datetime import datetime, timedelta
import uuid
from app.database import get_db
from app.dependencies.auth import get_current_user_id
from app.schemas.partner import (
    PartnerRequest,
    PartnerResponse,
    UserSearchResult,
    PartnerSummary
)
from app.models.partner import AccountabilityPartner
from app.models.user import User
from app.models.rating import Rating

router = APIRouter(prefix="/partners", tags=["partners"])


@router.get("/search", response_model=list[UserSearchResult])
async def search_users(
    q: str = Query(..., min_length=3),
    source: str = Query("app", pattern="^(app|pco)$"),
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Search for users by email or display_name (min 3 chars).
    Excludes self and existing partners."""

    if source == "pco":
        raise HTTPException(status_code=501, detail="PCO integration not yet implemented")

    # Get existing partner IDs (both directions)
    existing_partners = await db.execute(
        select(AccountabilityPartner.partner_user_id).where(
            AccountabilityPartner.user_id == user_id
        )
    )
    existing_partner_ids = set(existing_partners.scalars().all())

    # Also check reverse direction
    existing_partners_reverse = await db.execute(
        select(AccountabilityPartner.user_id).where(
            AccountabilityPartner.partner_user_id == user_id
        )
    )
    existing_partner_ids.update(existing_partners_reverse.scalars().all())
    existing_partner_ids.add(user_id)  # Exclude self

    # Search users
    search_pattern = f"%{q}%"
    result = await db.execute(
        select(User).where(
            and_(
                or_(
                    User.email.ilike(search_pattern),
                    User.display_name.ilike(search_pattern)
                ),
                User.id.notin_(existing_partner_ids)
            )
        ).limit(10)
    )
    users = result.scalars().all()

    return [UserSearchResult.from_orm(u) for u in users]


@router.post("/request", response_model=PartnerResponse)
async def send_partner_request(
    partner_request: PartnerRequest,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Send a partnership request. Creates one row (requester → recipient)."""

    # Validate recipient exists
    result = await db.execute(
        select(User).where(User.id == partner_request.partner_user_id)
    )
    recipient = result.scalar_one_or_none()
    if not recipient:
        raise HTTPException(status_code=404, detail="User not found")

    # Check for existing request/partnership
    existing = await db.execute(
        select(AccountabilityPartner).where(
            or_(
                and_(
                    AccountabilityPartner.user_id == user_id,
                    AccountabilityPartner.partner_user_id == partner_request.partner_user_id
                ),
                and_(
                    AccountabilityPartner.user_id == partner_request.partner_user_id,
                    AccountabilityPartner.partner_user_id == user_id
                )
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Partnership request already exists")

    # Get requester info
    requester = await db.execute(select(User).where(User.id == user_id))
    requester_user = requester.scalar_one()

    # Create request
    new_request = AccountabilityPartner(
        user_id=user_id,
        partner_user_id=partner_request.partner_user_id,
        requester_id=user_id,
        name=recipient.display_name or recipient.email,
        status="pending",
        message=partner_request.message
    )
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)

    # Build response
    response = PartnerResponse.from_orm(new_request)
    response.partner_display_name = recipient.display_name
    response.partner_email = recipient.email
    response.partner_photo = recipient.profile_photo_url

    return response


@router.get("/requests/incoming", response_model=list[PartnerResponse])
async def get_incoming_requests(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """List pending requests where I'm the recipient."""

    result = await db.execute(
        select(AccountabilityPartner).where(
            and_(
                AccountabilityPartner.partner_user_id == user_id,
                AccountabilityPartner.status == "pending",
                AccountabilityPartner.requester_id != user_id
            )
        )
    )
    requests = result.scalars().all()

    # Enrich with requester info
    responses = []
    for req in requests:
        requester = await db.execute(select(User).where(User.id == req.user_id))
        requester_user = requester.scalar_one_or_none()

        resp = PartnerResponse.from_orm(req)
        if requester_user:
            resp.partner_display_name = requester_user.display_name
            resp.partner_email = requester_user.email
            resp.partner_photo = requester_user.profile_photo_url
        responses.append(resp)

    return responses


@router.get("/requests/outgoing", response_model=list[PartnerResponse])
async def get_outgoing_requests(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """List pending requests where I'm the requester."""

    result = await db.execute(
        select(AccountabilityPartner).where(
            and_(
                AccountabilityPartner.user_id == user_id,
                AccountabilityPartner.status == "pending",
                AccountabilityPartner.requester_id == user_id
            )
        )
    )
    requests = result.scalars().all()

    # Enrich with recipient info
    responses = []
    for req in requests:
        recipient = await db.execute(select(User).where(User.id == req.partner_user_id))
        recipient_user = recipient.scalar_one_or_none()

        resp = PartnerResponse.from_orm(req)
        if recipient_user:
            resp.partner_display_name = recipient_user.display_name
            resp.partner_email = recipient_user.email
            resp.partner_photo = recipient_user.profile_photo_url
        responses.append(resp)

    return responses


@router.put("/requests/{request_id}/respond", response_model=PartnerResponse)
async def respond_to_request(
    request_id: uuid.UUID,
    action: str = Query(..., pattern="^(accept|decline)$"),
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Accept or decline a partnership request."""

    # Get the request
    result = await db.execute(
        select(AccountabilityPartner).where(AccountabilityPartner.id == request_id)
    )
    request_obj = result.scalar_one_or_none()

    if not request_obj:
        raise HTTPException(status_code=404, detail="Request not found")

    # Verify I'm the recipient
    if request_obj.partner_user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to respond to this request")

    if request_obj.status != "pending":
        raise HTTPException(status_code=400, detail="Request already responded to")

    # Update request
    request_obj.status = action + "ed"  # "accepted" or "declined"
    request_obj.responded_at = datetime.utcnow()

    # If accepted, create reciprocal partnership
    if action == "accept":
        # Get requester info
        requester = await db.execute(select(User).where(User.id == request_obj.user_id))
        requester_user = requester.scalar_one()

        # Create reciprocal row (so recipient can also view requester's data)
        reciprocal = AccountabilityPartner(
            user_id=user_id,  # I'm now the accountable person
            partner_user_id=request_obj.user_id,  # They're my partner
            requester_id=request_obj.requester_id,  # Keep original requester
            name=requester_user.display_name or requester_user.email,
            status="accepted",
            message=request_obj.message,
            responded_at=datetime.utcnow()
        )
        db.add(reciprocal)

    await db.commit()
    await db.refresh(request_obj)

    # Build response
    partner_user_result = await db.execute(
        select(User).where(User.id == request_obj.partner_user_id)
    )
    partner_user = partner_user_result.scalar_one_or_none()

    response = PartnerResponse.from_orm(request_obj)
    if partner_user:
        response.partner_display_name = partner_user.display_name
        response.partner_email = partner_user.email
        response.partner_photo = partner_user.profile_photo_url

    return response


@router.get("/", response_model=list[PartnerResponse])
async def get_partners(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """List accepted partners."""

    result = await db.execute(
        select(AccountabilityPartner).where(
            and_(
                AccountabilityPartner.user_id == user_id,
                AccountabilityPartner.status == "accepted"
            )
        )
    )
    partners = result.scalars().all()

    # Enrich with partner info
    responses = []
    for partner in partners:
        partner_user_result = await db.execute(
            select(User).where(User.id == partner.partner_user_id)
        )
        partner_user = partner_user_result.scalar_one_or_none()

        resp = PartnerResponse.from_orm(partner)
        if partner_user:
            resp.partner_display_name = partner_user.display_name
            resp.partner_email = partner_user.email
            resp.partner_photo = partner_user.profile_photo_url
        responses.append(resp)

    return responses


@router.get("/{partner_id}/summary", response_model=PartnerSummary)
async def get_partner_summary(
    partner_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get partner's discipleship summary (only if accepted partnership exists)."""

    # Verify accepted partnership exists
    partnership = await db.execute(
        select(AccountabilityPartner).where(
            and_(
                AccountabilityPartner.user_id == user_id,
                AccountabilityPartner.partner_user_id == partner_id,
                AccountabilityPartner.status == "accepted"
            )
        )
    )
    if not partnership.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="No accepted partnership with this user")

    # Get partner's info
    partner_result = await db.execute(select(User).where(User.id == partner_id))
    partner_user = partner_result.scalar_one_or_none()
    if not partner_user:
        raise HTTPException(status_code=404, detail="Partner not found")

    # Get last 7 days of ratings
    seven_days_ago = datetime.utcnow().date() - timedelta(days=7)
    ratings_result = await db.execute(
        select(Rating).where(
            and_(
                Rating.user_id == partner_id,
                Rating.date >= seven_days_ago
            )
        ).order_by(Rating.date.desc())
    )
    ratings = ratings_result.scalars().all()

    # Calculate metrics
    recent_ratings = []
    capitals_with_ratings = set()
    total_score = 0
    rating_count = 0

    for rating in ratings:
        recent_ratings.append({
            "date": rating.date.isoformat(),
            "capital_id": rating.capital_id,
            "score": rating.score
        })
        capitals_with_ratings.add(rating.capital_id)
        total_score += rating.score
        rating_count += 1

    # Calculate alignment score (average rating as percentage)
    alignment_score = int((total_score / rating_count) * 20) if rating_count > 0 else None

    # Calculate weekly completion (ratings per capital in last 7 days)
    weekly_completion = {}
    for capital in ["spiritual", "relational", "physical", "intellectual", "financial"]:
        capital_ratings = [r for r in ratings if r.capital_id == capital]
        completion_pct = int((len(capital_ratings) / 7) * 100)
        weekly_completion[capital] = completion_pct

    # Calculate streak (consecutive days with ratings)
    # Simplified: just count recent days with ratings
    dates_with_ratings = set(r.date for r in ratings)
    current_streak = len(dates_with_ratings)

    return PartnerSummary(
        partner_name=partner_user.display_name or partner_user.email,
        alignment_score=alignment_score,
        current_streak=current_streak,
        weekly_completion=weekly_completion,
        recent_ratings=recent_ratings,
        active_capitals=list(capitals_with_ratings)
    )


@router.delete("/{partnership_id}")
async def remove_partner(
    partnership_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Remove partnership (either side can remove)."""

    # Get the partnership
    result = await db.execute(
        select(AccountabilityPartner).where(AccountabilityPartner.id == partnership_id)
    )
    partnership = result.scalar_one_or_none()

    if not partnership:
        raise HTTPException(status_code=404, detail="Partnership not found")

    # Verify I'm either the user or the partner
    if partnership.user_id != user_id and partnership.partner_user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to remove this partnership")

    # Delete this partnership
    await db.delete(partnership)

    # If accepted, also delete the reciprocal partnership
    if partnership.status == "accepted":
        reciprocal = await db.execute(
            select(AccountabilityPartner).where(
                and_(
                    AccountabilityPartner.user_id == partnership.partner_user_id,
                    AccountabilityPartner.partner_user_id == partnership.user_id,
                    AccountabilityPartner.status == "accepted"
                )
            )
        )
        reciprocal_partnership = reciprocal.scalar_one_or_none()
        if reciprocal_partnership:
            await db.delete(reciprocal_partnership)

    await db.commit()

    return {"status": "removed"}
