from pydantic import BaseModel
from typing import Optional
from datetime import date, time, timedelta
from datetime import datetime

class FacultyProfileUpdate(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    office: Optional[str] = None



class MarkUnavailableRequest(BaseModel):
    date: date
    start_time: time
    end_time: time
    purpose: Optional[str] = None

from typing import List

class TimetableEntry(BaseModel):
    day_of_week: int
    hour: int
    subject: str = ""

class TimetableSave(BaseModel):
    entries: List[TimetableEntry]