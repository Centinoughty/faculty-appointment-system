from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from datetime import date, time, timedelta, datetime

from sqlalchemy.orm import Session
from sqlalchemy import case

from database import get_db
from models.models import User, Student, Faculty, Department, Slot, Appointment

from security.oauth2 import get_current_user
from schemas.faculty import FacultyProfileUpdate, MarkUnavailableRequest

router = APIRouter(prefix="/api/faculty", tags=["Faculty"])


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def require_faculty(current_user=Depends(get_current_user)):
    if current_user is None or current_user.role != "faculty":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to faculty only."
        )
    return current_user


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

@router.get("/profile")
def get_profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found.")

    dept = db.query(Department).filter(Department.id == faculty.department_id).first()

    return {
        "user_id": faculty.user_id,
        "name": current_user.name,
        "email": current_user.email,
        "designation": faculty.designation,
        "office": faculty.office,
        "department_name": dept.name if dept else None,
    }



# ---------------------------------------------------------------------------
# Appointments
# ---------------------------------------------------------------------------

@router.get("")
def get_faculty(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    
    faculty_list = db.query(Faculty).all()

    return [
        {   
            "id": f.user_id,
            "name": f.user.name,
            "email": f.user.email,
            "designation": f.designation,
            "office": f.office,
            "department": {"id": f.department.id, "name": f.department.name} if f.department else None,
            "busy": f.busy
        }
        for f in faculty_list
    ]


@router.get("/available-slots")
def get_available_slots(
    facultyId: int,
    date: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    faculty_id = facultyId
    faculty = db.query(Faculty).filter(Faculty.user_id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")

    if faculty.busy:
        raise HTTPException(status_code=400, detail="Faculty is currently unavailable for appointments")
   
    date = datetime.fromisoformat(date.replace("Z", "+00:00")).date()


    DAY_START = time(9, 0)
    DAY_END = time(17, 0)

    day_of_week = date.weekday()

    busy_slots = db.query(Slot).filter(
        Slot.faculty_id == faculty_id,
        Slot.day == day_of_week
    ).all()

    appointments = db.query(Appointment).filter(
        Appointment.faculty_id == faculty_id,
        Appointment.date == date,
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
    current = datetime.combine(date, snapped_start)
    end_of_day = datetime.combine(date, DAY_END)

    while current + timedelta(minutes=30) <= end_of_day:
        slot_start = current.time()
        slot_end = (current + timedelta(minutes=30)).time()

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
    slotss= [slot["start_time"] for slot in free_slots]
    return slotss


@router.post("/block")
def mark_unavailable(
    body: MarkUnavailableRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty)
):
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found.")

    if body.start_time >= body.end_time:
        raise HTTPException(status_code=400, detail="start_time must be before end_time")

    clashing_appt = db.query(Appointment).filter(
        Appointment.faculty_id == faculty.user_id,
        Appointment.date == body.date,
        Appointment.status.in_(["approved", "blocked"]),
        Appointment.start_time < body.end_time,
        Appointment.end_time > body.start_time
    ).first()

    if clashing_appt:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Clashes with an existing appointment "
                f"({clashing_appt.start_time.strftime('%H:%M')} – "
                f"{clashing_appt.end_time.strftime('%H:%M')}, "
                f"status: {clashing_appt.status})"
            )
        )

    blocked = Appointment(
        faculty_id=faculty.user_id,
        date=body.date,
        start_time=body.start_time,
        end_time=body.end_time,
        booker_id=faculty.user_id,
        purpose=body.purpose,
        status="blocked"
    )

    db.add(blocked)
    db.commit()
    db.refresh(blocked)

    return {
        "message": "Time slot marked as unavailable",
        "id": blocked.id,
        "date": str(blocked.date),
        "start_time": blocked.start_time.strftime("%H:%M"),
        "end_time": blocked.end_time.strftime("%H:%M"),
        "status": blocked.status
    }


@router.get("/appointment")
def get_pending_appointments(
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty)
):
    appointments = db.query(Appointment).filter(
        Appointment.faculty_id == current_user.id,
    ).order_by(
        Appointment.date.asc(),
        Appointment.start_time.asc()
    ).all()

    return [
        {
            "id": appt.id,
            "booker": {
                "name": appt.booker.name if appt.booker else None,
                "email": appt.booker.email if appt.booker else None,
            },
            "date": appt.date.isoformat(),
            "start_time": appt.start_time.strftime("%H:%M"),
            "end_time": appt.end_time.strftime("%H:%M"),
            "purpose": appt.purpose,
            "description": appt.description,
            "status": appt.status,
        }
        for appt in appointments
    ]

@router.put("/mark-busy")
def mark_busy(
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty)
):
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found.")

    faculty.busy = True
    db.commit()

    return {"message": "Marked as busy", "busy": faculty.busy}


@router.put("/mark-available")
def mark_available(
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty)
):
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found.")

    faculty.busy = False
    db.commit()

    return {"message": "Marked as available", "busy": faculty.busy}