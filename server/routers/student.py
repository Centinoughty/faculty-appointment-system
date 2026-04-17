from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, date, time, timedelta
from database import get_db
from models.models import User, Student, Faculty, Department, Slot, Appointment
from routers.notifications import create_notification
from security.oauth2 import get_current_user
from schemas.student import BookAppointmentRequest, StudentStats, StudentProfileUpdate
from websocket_manager import ws_manager
from services.appointment_service import get_free_slots, validate_and_book

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

    return get_free_slots(db, faculty_id, date)


@router.post("/faculty/book-appointment")
def book_appointment(
    body: BookAppointmentRequest,
    background_tasks: BackgroundTasks,
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

    appt_start_dt = datetime.combine(body.date, body.start_time)
    appt_end_dt = datetime.combine(body.date, body.end_time)
    
    create_notification(
        db=db,
        user_id=appointment.faculty.user_id,
        type="appointment_request",
        title="New Appointment Request",
        message=f"{current_user.name} has requested an appointment on {body.date} at {body.start_time.strftime('%H:%M')}.",
        email=appointment.faculty.user.email,
        appointment_details={
            "start_time": appt_start_dt,
            "end_time": appt_end_dt,
            "title": f"Appointment request from {current_user.name}",
            "purpose": body.purpose,
            "description": body.description
        }
    )

    background_tasks.add_task(
        ws_manager.send_personal_message,
        {"type": "REFRESH_REQUESTS"},
        appointment.faculty.user_id
    )

    return {"message": "Appointment requested successfully", "appointment_id": appointment.id}


@router.get("/appointments")
def get_appointments(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Not authorized")

    appointments = db.query(Appointment).filter(Appointment.booker_id == current_user.id).order_by(Appointment.created_at.desc()).all()

    return [
        {
            "id": appt.id,
            "faculty_id": appt.faculty_id,
            "faculty_name": appt.faculty.user.name if appt.faculty else "Faculty Member",
            "department_name": appt.faculty.department.name if appt.faculty and appt.faculty.department else "N/A",
            "office": appt.faculty.office if appt.faculty else "N/A",
            "imageUrl": appt.faculty.user.picture if appt.faculty and appt.faculty.user else None,
            "date": str(appt.date),
            "time": appt.start_time.strftime("%H:%M"),
            "start_time": appt.start_time.strftime("%H:%M"),
            "end_time": appt.end_time.strftime("%H:%M"),
            "purpose": appt.purpose,
            "status": appt.status,
            "rejection_reason": appt.rejection_reason
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
        
    # Notify Faculty of cancellation
    faculty_user = appointment.faculty.user
    create_notification(
        db=db,
        user_id=appointment.faculty_id,
        type="appointment_cancelled",
        title="Student Cancelled Appointment",
        message=f"{current_user.name} has cancelled their appointment scheduled for {appointment.date} at {appointment.start_time.strftime('%H:%M')}.",
        email=faculty_user.email,
        appointment_details={
            "start_time": datetime.combine(appointment.date, appointment.start_time),
            "end_time": datetime.combine(appointment.date, appointment.end_time),
            "purpose": appointment.purpose,
            "description": appointment.description
        }
    )

    db.delete(appointment)
    db.commit()
    return {"message": "Appointment cancelled"}