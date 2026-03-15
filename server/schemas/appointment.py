from pydantic import BaseModel
from datetime import date


class AppointmentCreate(BaseModel):
    professor_id: int
    date: date
    time: str
    purpose: str
    description: str


from typing import Optional

class AppointmentOut(BaseModel):
    id: int
    professor_id: int
    professor_name: Optional[str] = None
    student_id: int
    date: date
    time: str
    purpose: str
    description: str
    status: str

    class Config:
        from_attributes = True


class StudentStats(BaseModel):
    pending: int
    confirmed: int
    completed: int