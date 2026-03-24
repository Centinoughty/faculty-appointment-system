from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date, time, timedelta
from database import get_db
from models.models import User, Student, Faculty, Department, Slot, Appointment
from security.oauth2 import get_current_user
from schemas.student import BookAppointmentRequest

router = APIRouter(prefix="/api", tags=["Student"])




@router.post("/appointment")
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

    return {"message": "Appointment requested successfully", "appointment_id": appointment.id}


@router.get("/appointment")
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
            "faculty": appt.faculty.user.name if appt.faculty else None,
            "date": str(appt.date),
            "start_time": appt.start_time.strftime("%H:%M"),
            "end_time": appt.end_time.strftime("%H:%M"),
            "purpose": appt.purpose,
            "status": appt.status
        }
        for appt in appointments
    ]