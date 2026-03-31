from pydantic import BaseModel, Field
from datetime import date
from typing import Dict, Optional

class ReflectionUpdate(BaseModel):
    reflections: Dict[str, str] = Field(..., description="Capital ID or 'devotional' to content")

class ReflectionResponse(BaseModel):
    date: date
    reflections: Dict[str, str]
