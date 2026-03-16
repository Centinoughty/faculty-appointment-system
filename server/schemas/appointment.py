from pydantic import BaseModel
from datetime import date
from typing import Optional


class AppointmentCreate(BaseModel):
    professor_id: int
    date: date
    time: str
    purpose: str
    description: str


class AppointmentOut(BaseModel):
    id: int
    professor_id: int
    professor_name: Optional[str] = None
    student_id: int
    student_name: Optional[str] = None
    date: date
    time: str
    purpose: str
    description: str
    status: str
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True


class StudentStats(BaseModel):
    pending: int
    confirmed: int
    completed: int


class AppointmentStatusUpdate(BaseModel):
    """Request body for PATCH /api/faculty/appointments/{id}/status."""
    status: str              # confirmed | declined | cancelled | completed
    rejection_reason: Optional[str] = None


class FacultyStats(BaseModel):
    """Analytics counts for the faculty dashboard."""
    total: int
    pending: int
    confirmed: int
    declined: int
    completed: int
