from pydantic import BaseModel
from datetime import date
from typing import List


class TimetableEntryItem(BaseModel):
    """A single day+hour+subject entry for creating/saving."""
    day_of_week: str   # Monday … Sunday
    hour: int          # 0-23
    subject: str


class TimetableEntryOut(BaseModel):
    id: int
    professor_id: int
    day_of_week: str
    hour: int
    subject: str

    class Config:
        from_attributes = True


class TimetableSave(BaseModel):
    """
    Request body for POST /api/faculty/timetable.
    Replaces ALL existing entries for this professor atomically.
    Mirrors the frontend timetable grid data structure.
    """
    entries: List[TimetableEntryItem]


class TimetableExemptionCreate(BaseModel):
    """Request body for POST /api/faculty/timetable/exemptions."""
    date: date
    hour: int


class TimetableExemptionOut(BaseModel):
    id: int
    professor_id: int
    date: date
    hour: int

    class Config:
        from_attributes = True
