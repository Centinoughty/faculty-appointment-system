from pydantic import BaseModel
from typing import Optional
from datetime import date, time, timedelta
from datetime import datetime


class BookAppointmentRequest(BaseModel):
    facultyId: int
    startTime:str
    date: datetime
    purpose: str
    description: Optional[str] = None