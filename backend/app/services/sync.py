from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, date
import uuid
from app.models.investment import Investment
from app.models.rating import Rating
from app.models.reflection import Reflection
from app.models.event import CalendarEvent
from app.models.fasting import FastingRecord
from app.models.partner import AccountabilityPartner
from app.models.discipline import CustomDiscipline
from app.models.user import UserSettings
from app.utils.discipline_map import get_capital_for_discipline

async def bulk_import(db: AsyncSession, user_id: uuid.UUID, data: dict) -> dict:
    counts = {
        "investments": 0,
        "ratings": 0,
        "reflections": 0,
        "events": 0,
        "fasting": 0,
        "partners": 0,
        "custom_disciplines": 0
    }

    # Import disciplines (investments)
    for date_str, disciplines in data.get("disciplines", {}).items():
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        for discipline_id, completed in disciplines.items():
            # Check if exists
            result = await db.execute(
                select(Investment).where(
                    and_(
                        Investment.user_id == user_id,
                        Investment.date == date_obj,
                        Investment.discipline_id == discipline_id
                    )
                )
            )
            existing = result.scalar_one_or_none()

            if not existing:
                # Get capital_id from discipline mapping
                capital_id = get_capital_for_discipline(discipline_id)
                investment = Investment(
                    user_id=user_id,
                    date=date_obj,
                    discipline_id=discipline_id,
                    capital_id=capital_id,
                    completed=completed
                )
                db.add(investment)
                counts["investments"] += 1

    # Import ratings
    for date_str, ratings in data.get("ratings", {}).items():
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        for capital_id, score in ratings.items():
            result = await db.execute(
                select(Rating).where(
                    and_(
                        Rating.user_id == user_id,
                        Rating.date == date_obj,
                        Rating.capital_id == capital_id
                    )
                )
            )
            existing = result.scalar_one_or_none()

            if not existing:
                rating = Rating(
                    user_id=user_id,
                    date=date_obj,
                    capital_id=capital_id,
                    score=score
                )
                db.add(rating)
                counts["ratings"] += 1

    # Import reflections
    for date_str, reflections in data.get("reflections", {}).items():
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        for key, content in reflections.items():
            capital_id = None if key == "devotional" else key
            reflection_type = "devotional" if key == "devotional" else "capital"

            result = await db.execute(
                select(Reflection).where(
                    and_(
                        Reflection.user_id == user_id,
                        Reflection.date == date_obj,
                        Reflection.capital_id == capital_id,
                        Reflection.type == reflection_type
                    )
                )
            )
            existing = result.scalar_one_or_none()

            if not existing:
                reflection = Reflection(
                    user_id=user_id,
                    date=date_obj,
                    capital_id=capital_id,
                    type=reflection_type,
                    content=content
                )
                db.add(reflection)
                counts["reflections"] += 1

    # Import events
    for event_data in data.get("events", []):
        event = CalendarEvent(
            user_id=user_id,
            date=datetime.strptime(event_data["date"], "%Y-%m-%d").date(),
            title=event_data["title"],
            event_type=event_data["type"],
            time=event_data.get("time"),
            notes=event_data.get("notes")
        )
        db.add(event)
        counts["events"] += 1

    # Import fasting
    for fast_data in data.get("fasting", []):
        fast = FastingRecord(
            user_id=user_id,
            date=datetime.strptime(fast_data["date"], "%Y-%m-%d").date(),
            fast_type=fast_data["type"],
            start_time=fast_data.get("startTime"),
            end_time=fast_data.get("endTime"),
            notes=fast_data.get("notes"),
            completed=fast_data.get("completed", False)
        )
        db.add(fast)
        counts["fasting"] += 1

    # Import partners
    for partner_data in data.get("partners", []):
        partner = AccountabilityPartner(
            user_id=user_id,
            name=partner_data["name"],
            color=partner_data.get("color")
        )
        db.add(partner)
        counts["partners"] += 1

    # Import custom disciplines
    for disc_data in data.get("custom_disciplines", []):
        discipline = CustomDiscipline(
            user_id=user_id,
            capital_id=disc_data["capitalId"],
            label=disc_data["label"]
        )
        db.add(discipline)
        counts["custom_disciplines"] += 1

    # Import settings
    settings = data.get("settings", {})
    if settings:
        result = await db.execute(
            select(UserSettings).where(UserSettings.user_id == user_id)
        )
        user_settings = result.scalar_one_or_none()

        if user_settings:
            if "theme" in settings:
                user_settings.theme = settings["theme"]
            if "capitals" in settings:
                user_settings.enabled_capitals = settings["capitals"]
            if "onboardingComplete" in settings:
                user_settings.onboarding_complete = settings["onboardingComplete"]
            if "introGuideComplete" in settings:
                user_settings.intro_guide_seen = settings["introGuideComplete"]

    await db.commit()
    return counts
