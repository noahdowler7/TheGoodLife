from pydantic import BaseModel
from typing import Dict, List

class WeeklySummary(BaseModel):
    week_start: str
    week_end: str
    completion_by_capital: Dict[str, float]
    avg_ratings_by_capital: Dict[str, float]

class InsightItem(BaseModel):
    type: str
    message: str
    severity: str

class AlignmentScore(BaseModel):
    score: float
    period_days: int
    interpretation: str

class TrendsResponse(BaseModel):
    insights: List[InsightItem]
    streaks: Dict[str, int]
    alignment: AlignmentScore
