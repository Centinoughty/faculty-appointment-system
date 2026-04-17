from datetime import datetime, date, time, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.models import Faculty, Slot, Appointment

def get_free_slots(db: Session, faculty_id: int, target_date: date):
    faculty = db.query(Faculty).filter(Faculty.user_id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")

    if faculty.busy:
        raise HTTPException(status_code=400, detail="Faculty is currently unavailable for appointments")

    # Holiday/Weekend check
    if target_date.weekday() >= 5:
        return []

    DAY_START = time(9, 0)
    DAY_END = time(17, 0)

    busy_slots = db.query(Slot).filter(
        Slot.faculty_id == faculty_id,
        Slot.day == target_date.weekday()
    ).all()

    appointments = db.query(Appointment).filter(
        Appointment.faculty_id == faculty_id,
        Appointment.date == target_date,
        Appointment.status.in_(["approved", "blocked"])
    ).all()

    busy_intervals = []
    for slot in busy_slots:
        busy_intervals.append((slot.start_time, slot.end_time))
    for appt in appointments:
        busy_intervals.append((appt.start_time, appt.end_time))

    def next_30_min_boundary(t: time) -> time:
        total_minutes = t.hour * 60 + t.minute
        remainder = total_minutes % 30
        if remainder == 0:
            return t
        snapped = total_minutes + (30 - remainder)
        return time(snapped // 60, snapped % 60)

    snapped_start = next_30_min_boundary(DAY_START)
    free_slots = []
    current = datetime.combine(target_date, snapped_start)
    end_of_day = datetime.combine(target_date, DAY_END)
    now = datetime.now()
    
    while current + timedelta(minutes=30) <= end_of_day:
        slot_start = current.time()
        slot_end = (current + timedelta(minutes=30)).time()

        # Check if slot is in the past
        is_past = False
        if target_date < now.date():
            is_past = True
        elif target_date == now.date():
            if current < now:
                is_past = True

        is_busy = any(
            slot_start < busy_end and slot_end > busy_start
            for busy_start, busy_end in busy_intervals
        )

        if not is_busy and not is_past:
            free_slots.append(slot_start.strftime("%H:%M"))

        current += timedelta(minutes=30)

    return free_slots

def validate_and_book(db: Session, faculty_id: int, booker_id: int, body_date: date, start_time: time, end_time: time, purpose: str, description: str):
    faculty = db.query(Faculty).filter(Faculty.user_id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")

    if faculty.busy:
        raise HTTPException(status_code=400, detail="Faculty is currently unavailable for appointments")

    # Time validation
    if (start_time.hour * 60 + start_time.minute) % 30 != 0:
        raise HTTPException(status_code=400, detail="Appointments can only start at 30-minute boundaries")

    start_dt = datetime.combine(body_date, start_time)
    end_dt = datetime.combine(body_date, end_time)
    if end_dt - start_dt != timedelta(minutes=30):
        raise HTTPException(status_code=400, detail="Appointment duration must be exactly 30 minutes")

    # Holiday/Weekend check
    if body_date.weekday() >= 5:
        raise HTTPException(status_code=400, detail="Appointments cannot be booked on Saturdays or Sundays.")

    # Conflict checks
    conflicting_slot = db.query(Slot).filter(
        Slot.faculty_id == faculty_id,
        Slot.day == body_date.weekday(),
        Slot.start_time < end_time,
        Slot.end_time > start_time
    ).first()

    if conflicting_slot:
        raise HTTPException(status_code=400, detail="Faculty is busy during this time")

    conflicting_appointment = db.query(Appointment).filter(
        Appointment.faculty_id == faculty_id,
        Appointment.date == body_date,
        Appointment.status.in_(["approved", "blocked"]),
        Appointment.start_time < end_time,
        Appointment.end_time > start_time
    ).first()

    if conflicting_appointment:
        raise HTTPException(status_code=400, detail="Time slot is not available")

    # Daily limit check (per faculty per student)
    daily_requests = db.query(Appointment).filter(
        Appointment.booker_id == booker_id,
        Appointment.faculty_id == faculty_id,
        Appointment.date == body_date
    ).count()

    if daily_requests >= 4:
        raise HTTPException(status_code=400, detail="Daily limit of 4 requests per faculty reached.")

    # Create appointment
    appt = Appointment(
        faculty_id=faculty_id,
        date=body_date,
        start_time=start_time,
        end_time=end_time,
        booker_id=booker_id,
        purpose=purpose,
        description=description,
        status="pending"
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt
