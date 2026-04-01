"""
Discipline ID to Capital ID mapping.

This mapping mirrors the frontend capitals.js structure and is used
by the sync service to correctly assign capital_id when importing
localStorage data to the backend database.
"""

# Map of discipline_id -> capital_id
DISCIPLINE_TO_CAPITAL = {
    # Spiritual
    'bible-reading': 'spiritual',
    'prayer': 'spiritual',
    'worship': 'spiritual',
    'fasting': 'spiritual',
    'meditation': 'spiritual',

    # Relational
    'serving': 'relational',
    'fellowship': 'relational',
    'encouraging': 'relational',
    'family-time': 'relational',

    # Physical
    'exercise': 'physical',
    'rest-sleep': 'physical',
    'healthy-eating': 'physical',
    'outdoor-time': 'physical',

    # Intellectual
    'reading-study': 'intellectual',
    'learning': 'intellectual',
    'creative-work': 'intellectual',
    'planning': 'intellectual',

    # Financial
    'giving-tithing': 'financial',
    'budgeting': 'financial',
    'generosity': 'financial',
    'saving': 'financial',
}

def get_capital_for_discipline(discipline_id: str) -> str:
    """
    Get the capital_id for a given discipline_id.

    Args:
        discipline_id: The discipline identifier (e.g., 'bible-reading')

    Returns:
        The capital_id (e.g., 'spiritual'), or 'spiritual' as default fallback
    """
    return DISCIPLINE_TO_CAPITAL.get(discipline_id, 'spiritual')
