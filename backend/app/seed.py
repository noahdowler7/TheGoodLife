"""
Seed reference data for capitals and default disciplines.
Run once: python -m app.seed
"""
import asyncio
from app.database import async_session_maker
from app.models.capital import Capital, DefaultDiscipline
from sqlalchemy import select

CAPITALS_DATA = [
    {"id": "spiritual", "label": "Spiritual Capital", "priority": 1, "color": "#D4A843", "icon": "cross"},
    {"id": "relational", "label": "Relational Capital", "priority": 2, "color": "#E07B6A", "icon": "heart"},
    {"id": "physical", "label": "Physical Capital", "priority": 3, "color": "#5BB98B", "icon": "activity"},
    {"id": "intellectual", "label": "Intellectual Capital", "priority": 4, "color": "#6B8DE3", "icon": "book"},
    {"id": "financial", "label": "Financial Capital", "priority": 5, "color": "#B07EE0", "icon": "dollar"},
]

DISCIPLINES_DATA = [
    # Spiritual
    {"id": "bible-reading", "capital_id": "spiritual", "label": "Bible Reading", "sort_order": 1},
    {"id": "prayer", "capital_id": "spiritual", "label": "Prayer", "sort_order": 2},
    {"id": "worship", "capital_id": "spiritual", "label": "Worship", "sort_order": 3},
    {"id": "fasting", "capital_id": "spiritual", "label": "Fasting", "sort_order": 4},
    {"id": "meditation", "capital_id": "spiritual", "label": "Meditation on Scripture", "sort_order": 5},
    # Relational
    {"id": "serving", "capital_id": "relational", "label": "Serving Others", "sort_order": 1},
    {"id": "fellowship", "capital_id": "relational", "label": "Fellowship / Community", "sort_order": 2},
    {"id": "encouraging", "capital_id": "relational", "label": "Encouraging Someone", "sort_order": 3},
    {"id": "family-time", "capital_id": "relational", "label": "Family Time", "sort_order": 4},
    # Physical
    {"id": "exercise", "capital_id": "physical", "label": "Exercise", "sort_order": 1},
    {"id": "rest-sleep", "capital_id": "physical", "label": "Rest / Sleep", "sort_order": 2},
    {"id": "healthy-eating", "capital_id": "physical", "label": "Healthy Eating", "sort_order": 3},
    {"id": "outdoor-time", "capital_id": "physical", "label": "Outdoor Time", "sort_order": 4},
    # Intellectual
    {"id": "reading-study", "capital_id": "intellectual", "label": "Reading / Study", "sort_order": 1},
    {"id": "learning", "capital_id": "intellectual", "label": "Learning Something New", "sort_order": 2},
    {"id": "creative-work", "capital_id": "intellectual", "label": "Creative Work", "sort_order": 3},
    {"id": "planning", "capital_id": "intellectual", "label": "Planning / Strategy", "sort_order": 4},
    # Financial
    {"id": "giving-tithing", "capital_id": "financial", "label": "Giving / Tithing", "sort_order": 1},
    {"id": "budgeting", "capital_id": "financial", "label": "Budgeting", "sort_order": 2},
    {"id": "generosity", "capital_id": "financial", "label": "Generosity", "sort_order": 3},
    {"id": "saving", "capital_id": "financial", "label": "Saving", "sort_order": 4},
]


async def seed():
    async with async_session_maker() as db:
        # Check if already seeded
        result = await db.execute(select(Capital))
        existing = result.scalars().all()

        if existing:
            print(f"✓ Already seeded: {len(existing)} capitals exist")
            return

        # Insert capitals
        for capital_data in CAPITALS_DATA:
            capital = Capital(**capital_data)
            db.add(capital)

        await db.flush()
        print(f"✓ Inserted {len(CAPITALS_DATA)} capitals")

        # Insert default disciplines
        for discipline_data in DISCIPLINES_DATA:
            discipline = DefaultDiscipline(**discipline_data)
            db.add(discipline)

        await db.commit()
        print(f"✓ Inserted {len(DISCIPLINES_DATA)} default disciplines")
        print("✓ Seed complete")


if __name__ == "__main__":
    asyncio.run(seed())
