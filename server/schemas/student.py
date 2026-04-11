from pydantic import BaseModel
from typing import Optional
from datetime import date, time, timedelta
from datetime import datetime


class BookAppointmentRequest(BaseModel):
    faculty_id: int
    date: date
    start_time: time
    end_time: time
    purpose: str
    description: str

class StudentStats(BaseModel):
    pending: int
    confirmed: int
    completed: int

class StudentProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    semester: Optional[int] = None