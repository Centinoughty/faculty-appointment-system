from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date, time, timedelta
from database import get_db
from models.models import User, Student, Faculty, Department, Slot, Appointment
from routers.notifications import create_notification
from security.oauth2 import get_current_user
from schemas.student import BookAppointmentRequest, StudentStats, StudentProfileUpdate

router = APIRouter(prefix="/api/student", tags=["Student"])


@router.get("/faculty")
def get_faculty(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    faculty_list = db.query(Faculty).all()

    return [
        {   
            "user_id": f.user_id,
            "name": f.user.name,
            "email": f.user.email,
            "designation": f.designation,
            "office": f.office,
            "department_name": f.department.name if f.department else None,
            "busy": f.busy,
            "research_interests": []
        }
        for f in faculty_list
    ]


@router.get("/faculty/{faculty_id}/available-slots")
def get_available_slots(
    faculty_id: int,
    date: date,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not authorized")

    faculty = db.query(Faculty).filter(Faculty.user_id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")

    if faculty.busy:
        raise HTTPException(status_code=400, detail="Faculty is currently unavailable for appointments")

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
            free_slots.append(slot_start.strftime("%H:%M"))

        current += timedelta(minutes=30)

    return free_slots


@router.post("/faculty/book-appointment")
def book_appointment(
    body: BookAppointmentRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not authorized")

    faculty = db.query(Faculty).filter(Faculty.user_id == body.faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")

    if faculty.busy:
        raise HTTPException(status_code=400, detail="Faculty is currently unavailable for appointments")

    total_minutes = body.start_time.hour * 60 + body.start_time.minute
    if total_minutes % 30 != 0:
        raise HTTPException(status_code=400, detail="Appointments can only start at 30-minute boundaries (e.g. 9:00, 9:30, 10:00)")

    start_dt = datetime.combine(body.date, body.start_time)
    end_dt = datetime.combine(body.date, body.end_time)
    if end_dt - start_dt != timedelta(minutes=30):
        raise HTTPException(status_code=400, detail="Appointment duration must be exactly 30 minutes")

    day_of_week = body.date.weekday()

    conflicting_slot = db.query(Slot).filter(
        Slot.faculty_id == body.faculty_id,
        Slot.day == day_of_week,
        Slot.start_time < body.end_time,
        Slot.end_time > body.start_time
    ).first()

    if conflicting_slot:
        raise HTTPException(status_code=400, detail="Faculty is busy during this time")

    conflicting_appointment = db.query(Appointment).filter(
        Appointment.faculty_id == body.faculty_id,
        Appointment.date == body.date,
        Appointment.status.in_(["approved", "blocked"]),
        Appointment.start_time < body.end_time,
        Appointment.end_time > body.start_time
    ).first()

    if conflicting_appointment:
        raise HTTPException(status_code=400, detail="Time slot is not available")

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    daily_requests = db.query(Appointment).filter(
        Appointment.booker_id == current_user.id,
        Appointment.faculty_id == body.faculty_id,
        Appointment.date == body.date
    ).count()

    if daily_requests >= 4:
        raise HTTPException(status_code=400, detail="Daily limit of 4 requests per faculty reached.")

    appointment = Appointment(
        faculty_id=body.faculty_id,
        date=body.date,
        start_time=body.start_time,
        end_time=body.end_time,
        booker_id=current_user.id,
        purpose=body.purpose,
        status="pending"
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    create_notification(
        db=db,
        user_id=faculty.user_id,
        type="appointment_request",
        title="New Appointment Request",
        message=f"{current_user.name} has requested an appointment on {body.date} at {body.start_time.strftime('%H:%M')}.",
        email=faculty.user.email
    )

    return {"message": "Appointment requested successfully", "appointment_id": appointment.id}


@router.get("/appointments")
def get_appointments(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not authorized")

    appointments = db.query(Appointment).filter(Appointment.booker_id == current_user.id).all()

    return [
        {
            "id": appt.id,
            "professor_id": appt.faculty_id,
            "professor_name": appt.faculty.user.name if appt.faculty else None,
            "date": str(appt.date),
            "time": appt.start_time.strftime("%H:%M"),
            "start_time": appt.start_time.strftime("%H:%M"),
            "end_time": appt.end_time.strftime("%H:%M"),
            "purpose": appt.purpose,
            "status": appt.status
        }
        for appt in appointments
    ]

@router.get("/stats", response_model=StudentStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    base = db.query(Appointment).filter(Appointment.booker_id == current_user.id)
    return {
        "pending": base.filter(Appointment.status == "pending").count(),
        "confirmed": base.filter(Appointment.status == "approved").count(),
        "completed": base.filter(Appointment.status == "cancelled").count(),
    }

@router.put("/profile")
def update_profile(
    body: StudentProfileUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    user = db.query(User).filter(User.id == current_user.id).first()
    
    if body.name is not None:
        user.name = body.name
    if body.phone is not None:
        student.phone = body.phone
    if body.semester is not None:
        student.year = body.semester
        
    db.commit()
    return {"message": "Profile updated"}

@router.delete("/appointments/{appointment_id}")
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.booker_id == current_user.id
    ).first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    db.delete(appointment)
    db.commit()
    return {"message": "Appointment cancelled"}