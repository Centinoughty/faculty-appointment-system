from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd
from datetime import datetime
from database import get_db
from models.models import User, Student, Professor, Department, Slot,Appointment

from security.oauth2 import get_current_user

router = APIRouter(prefix="/api/student", tags=["Student"])


@router.get("/professors")
def get_professors(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    professors = db.query(Professor).all()

    return [
        {
            "name": prof.name,
            "email": prof.user.email,
            "department": prof.department.name if prof.department else None
        }
        for prof in professors
    ]

from datetime import date, time, timedelta

@router.get("/available-slots")
def get_available_slots(
    professor_id: int,
    date: date,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    DAY_START = time(9, 0)
    DAY_END = time(17, 0)
    
    day_of_week = date.weekday()  # Monday=0, Sunday=6

    # Get busy slots for this professor on this day of the week
    busy_slots = db.query(Slot).filter(
        Slot.professor_id == professor_id,
        Slot.day == day_of_week
    ).all()

    # Get appointments on this specific date that aren't declined/cancelled
    appointments = db.query(Appointment).filter(
        Appointment.professor_id == professor_id,
        Appointment.date == date,
        Appointment.status.notin_(["declined", "cancelled"])
    ).all()

    # Collect all busy intervals
    busy_intervals = []
    for slot in busy_slots:
        busy_intervals.append((slot.start_time, slot.end_time))
    for appt in appointments:
        busy_intervals.append((appt.start_time, appt.end_time))

    # Generate free 30-min slots between 9am - 5pm
    free_slots = []
    current = datetime.combine(date, DAY_START)
    end_of_day = datetime.combine(date, DAY_END)

    while current + timedelta(minutes=30) <= end_of_day:
        slot_start = current.time()
        slot_end = (current + timedelta(minutes=30)).time()

        # Check if this window overlaps with any busy interval
        is_busy = any(
            slot_start < busy_end and slot_end > busy_start
            for busy_start, busy_end in busy_intervals
        )

        if not is_busy:
            free_slots.append({
                "start_time": slot_start.strftime("%H:%M"),
                "end_time": slot_end.strftime("%H:%M")
            })

        current += timedelta(minutes=30)

    return {"date": str(date), "free_slots": free_slots}