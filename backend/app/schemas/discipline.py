from pydantic import BaseModel
from typing import Optional, List
import uuid

class CustomDisciplineCreate(BaseModel):
    capital_id: str
    label: str

class CustomDisciplineResponse(BaseModel):
    id: uuid.UUID
    capital_id: str
    label: str

    class Config:
        from_attributes = True

class DisciplineListResponse(BaseModel):
    default: List[dict]
    custom: List[CustomDisciplineResponse]
