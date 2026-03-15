from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.models import Appointment, Professor, Department
from schemas.appointment import AppointmentCreate, AppointmentOut, StudentStats
from schemas.faculty import FacultyOut
from security.oauth2 import get_current_user

router = APIRouter(prefix="/api/student", tags=["Student"])

@router.get("/stats", response_model=StudentStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    pending = db.query(Appointment).filter(
        Appointment.student_id == current_user.id,
        Appointment.status == "pending"
    ).count()

    confirmed = db.query(Appointment).filter(
        Appointment.student_id == current_user.id,
        Appointment.status == "confirmed"
    ).count()

    completed = db.query(Appointment).filter(
        Appointment.student_id == current_user.id,
        Appointment.status == "completed"
    ).count()

    return {
        "pending": pending,
        "confirmed": confirmed,
        "completed": completed
    }

@router.get("/faculty", response_model=List[FacultyOut])
def get_faculty(
    db: Session = Depends(get_db)
):
    # Join with Department to get department names
    results = db.query(Professor, Department.name.label("dept_name")).join(
        Department, Professor.department_id == Department.id, isouter=True
    ).all()

    faculty_list = []
    for prof, dept_name in results:
        faculty_list.append({
            "user_id": prof.user_id,
            "name": prof.name,
            "department_name": dept_name
        })

    return faculty_list

@router.post("/appointments", response_model=AppointmentOut)
def create_appointment(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    new_appointment = Appointment(
        student_id=current_user.id,
        professor_id=appointment.professor_id,
        date=appointment.date,
        time=appointment.time,
        purpose=appointment.purpose,
        description=appointment.description
    )

    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    # To include professor name in response
    prof = db.query(Professor).filter(Professor.user_id == new_appointment.professor_id).first()
    new_appointment.professor_name = prof.name if prof else "Unknown"

    return new_appointment

@router.get("/my-requests", response_model=list[AppointmentOut])
def my_requests(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Join with Professor to get the name
    results = db.query(Appointment, Professor.name).join(
        Professor, Appointment.professor_id == Professor.user_id
    ).filter(
        Appointment.student_id == current_user.id
    ).all()

    appointments = []
    for appt, prof_name in results:
        appt.professor_name = prof_name
        appointments.append(appt)

    return appointments

@router.delete("/appointments/{appointment_id}")
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.student_id == current_user.id
    ).first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    db.delete(appointment)
    db.commit()
    return {"message": "Appointment cancelled successfully"}