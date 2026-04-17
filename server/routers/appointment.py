from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date, time, timedelta
from database import get_db
from models.models import User, Student, Faculty, Department, Slot, Appointment
from security.oauth2 import get_current_user
from services.appointment_service import get_free_slots, validate_and_book
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

    appointment = validate_and_book(
        db=db,
        faculty_id=body.faculty_id,
        booker_id=current_user.id,
        body_date=body.date,
        start_time=body.start_time,
        end_time=body.end_time,
        purpose=body.purpose,
        description=body.description
    )
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