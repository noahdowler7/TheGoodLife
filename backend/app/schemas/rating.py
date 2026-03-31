from pydantic import BaseModel, Field
from datetime import date
from typing import Dict

class RatingUpdate(BaseModel):
    ratings: Dict[str, int] = Field(..., description="Capital ID to score (1-5)")

class RatingResponse(BaseModel):
    date: date
    ratings: Dict[str, int]
