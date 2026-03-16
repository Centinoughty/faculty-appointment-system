from pydantic import BaseModel
from datetime import date
from typing import Optional


class AvailabilitySlotCreate(BaseModel):
    """Request body for POST /api/faculty/availability."""
    date: date
    hour: int            # 0-23
    title: str
    slot_type: str = "available"   # available | busy


class AvailabilitySlotOut(BaseModel):
    id: int
    professor_id: int
    date: date
    hour: int
    title: str
    slot_type: str

    class Config:
        from_attributes = True
