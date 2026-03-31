from pydantic import BaseModel
from typing import Dict, List, Any, Optional

class SyncPushRequest(BaseModel):
    disciplines: Dict[str, Dict[str, bool]] = {}  # {"2026-03-30": {"bible-reading": true}}
    ratings: Dict[str, Dict[str, int]] = {}  # {"2026-03-30": {"spiritual": 4}}
    reflections: Dict[str, Dict[str, str]] = {}  # {"2026-03-30": {"spiritual": "text"}}
    events: List[Dict[str, Any]] = []
    fasting: List[Dict[str, Any]] = []
    partners: List[Dict[str, Any]] = []
    custom_disciplines: List[Dict[str, Any]] = []
    settings: Dict[str, Any] = {}

class SyncPushResponse(BaseModel):
    status: str
    counts: Dict[str, int]

class SyncPullResponse(BaseModel):
    disciplines: Dict[str, Dict[str, bool]]
    ratings: Dict[str, Dict[str, int]]
    reflections: Dict[str, Dict[str, str]]
    events: List[Dict[str, Any]]
    fasting: List[Dict[str, Any]]
    partners: List[Dict[str, Any]]
    custom_disciplines: List[Dict[str, Any]]
    settings: Dict[str, Any]
