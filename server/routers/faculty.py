from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from datetime import date, datetime

from sqlalchemy.orm import Session
import pandas as pd
from datetime import datetime
from database import get_db
from models.models import User, Student, Professor, Department, Slot,Appointment

from security.oauth2 import get_current_user


from schemas.appointment import AppointmentOut, AppointmentStatusUpdate, FacultyStats
from schemas.faculty import FacultyProfileOut, FacultyProfileUpdate
from schemas.availability import AvailabilitySlotCreate, AvailabilitySlotOut
from schemas.timetable import (
    TimetableSave, TimetableEntryOut,
    TimetableExemptionCreate, TimetableExemptionOut
)

router = APIRouter(prefix="/api/faculty", tags=["Professor"])


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def require_professor(current_user=Depends(get_current_user)):
    """Dependency: ensures the calling user is a professor."""
    if current_user is None or current_user.role != "professor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to professors only."
        )
    return current_user


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

@router.get("/profile", response_model=FacultyProfileOut)
def get_profile(
    db: Session = Depends(get_db),
    current_user=Depends(require_professor)
):
    """Return the logged-in professor's full profile."""
    prof = db.query(Professor).filter(Professor.user_id == current_user.id).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Professor profile not found.")

    dept = db.query(Department).filter(Department.id == prof.department_id).first()

    return {
        "user_id": prof.user_id,
        "name": prof.name,
        "email": current_user.email,
        "designation": prof.designation,
        "office": prof.office,
        "employee_id": prof.employee_id,
        "department_name": dept.name if dept else None,
        # keywords are stored comma-separated; split into list for the frontend
        "keywords": [kw.strip() for kw in (prof.keywords or "").split(",") if kw.strip()],
    }


@router.put("/profile", response_model=FacultyProfileOut)
def update_profile(
    body: FacultyProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_professor)
):
    """Update the logged-in professor's editable profile fields."""
    prof = db.query(Professor).filter(Professor.user_id == current_user.id).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Professor profile not found.")

    prof.name = body.name
    if body.designation is not None:
        prof.designation = body.designation
    if body.office is not None:
        prof.office = body.office
    if body.employee_id is not None:
        prof.employee_id = body.employee_id
    if body.keywords is not None:
        prof.keywords = ",".join(body.keywords)

    db.commit()
    db.refresh(prof)

    dept = db.query(Department).filter(Department.id == prof.department_id).first()

    return {
        "user_id": prof.user_id,
        "name": prof.name,
        "email": current_user.email,
        "designation": prof.designation,
        "office": prof.office,
        "employee_id": prof.employee_id,
        "department_name": dept.name if dept else None,
        "keywords": [kw.strip() for kw in (prof.keywords or "").split(",") if kw.strip()],
    }


# ---------------------------------------------------------------------------
# Appointments
# ---------------------------------------------------------------------------

from datetime import date, time, timedelta

@router.post("/mark-unavailable")
def mark_unavailable(
    professor_id: int,
    date: date,
    start_time: time,
    end_time: time,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Only the professor themselves can block their own time
    professor = db.query(Professor).filter(
        Professor.user_id == current_user.id
    ).first()

    if not professor:
        raise HTTPException(status_code=403, detail="Only professors can mark unavailability")

    if professor.user_id != professor_id:
        raise HTTPException(status_code=403, detail="You can only block your own schedule")

    # Validate time range
    if start_time >= end_time:
        raise HTTPException(status_code=400, detail="start_time must be before end_time")

    # Check if this block overlaps with any existing non-cancelled appointment
    clashing_appt = db.query(Appointment).filter(
        Appointment.professor_id == professor.user_id,
        Appointment.date == date,
        Appointment.status.notin_(["declined", "cancelled"]),
        Appointment.start_time < end_time,
        Appointment.end_time > start_time
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

    # Create a professor-blocked appointment record
    blocked = Appointment(
        professor_id=professor.user_id,
        date=date,
        start_time=start_time,
        end_time=end_time,
        student_id=None,
        purpose=None,
        location=None,
        status="blocked",
        created_by="professor"
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

from sqlalchemy import case
@router.get("/appointments")
def get_appointments(
    db: Session = Depends(get_db),
    current_user=Depends(require_professor)
):
    """Get all appointments for the logged-in professor."""
    appointments = db.query(Appointment).filter(
            Appointment.professor_id == current_user.id
        ).order_by(
            case((Appointment.status == "pending", 0), else_=1),
            Appointment.date.asc()
        ).all()
    return [
        {
            "id": appt.id,
            "student": appt.student.name if appt.student else None,
            "date": appt.date.isoformat(),
            "start_time": appt.start_time.strftime("%H:%M"),
            "end_time": appt.end_time.strftime("%H:%M"),
            "purpose": appt.purpose,
            "description": appt.description,
            "location": appt.location,
            "status": appt.status,
            "created_by": appt.created_by
        }
        for appt in appointments
    ]


@router.put("/appointments/confirm/{appointment_id}")
def confirm_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Fetch the appointment
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Only the assigned professor can confirm
    professor = db.query(Professor).filter(
        Professor.user_id == current_user.id
    ).first()

    if not professor or appointment.professor_id != professor.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to confirm this appointment")

    if appointment.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Appointment is already '{appointment.status}' and cannot be confirmed"
        )

    appt_date = appointment.date
    appt_start = appointment.start_time
    appt_end = appointment.end_time
    day_of_week = appt_date.weekday()

    # --- Clash check 1: professor's recurring weekly busy slots ---
    clashing_slot = db.query(Slot).filter(
        Slot.professor_id == professor.user_id,
        Slot.day == day_of_week,
        Slot.start_time < appt_end,
        Slot.end_time > appt_start
    ).first()

    if clashing_slot:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Clashes with a recurring busy slot on this weekday "
                f"({clashing_slot.start_time.strftime('%H:%M')} – "
                f"{clashing_slot.end_time.strftime('%H:%M')})"
            )
        )

    # --- Clash check 2: other confirmed/pending appointments on the same date ---
    clashing_appt = db.query(Appointment).filter(
        Appointment.professor_id == professor.user_id,
        Appointment.date == appt_date,
        Appointment.id != appointment_id,                        # exclude self
        Appointment.status.notin_(["declined", "cancelled"]),
        Appointment.start_time < appt_end,
        Appointment.end_time > appt_start
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

    # All clear — confirm it
    appointment.status = "confirmed"
    db.commit()
    db.refresh(appointment)

    return {
        "message": "Appointment confirmed successfully",
        "appointment_id": appointment.id,
        "date": str(appointment.date),
        "start_time": appointment.start_time.strftime("%H:%M"),
        "end_time": appointment.end_time.strftime("%H:%M"),
        "student_id": appointment.student_id,
        "status": appointment.status
    }

@router.post("/appointments/decline/{appointment_id}")
def decline_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Fetch the appointment
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Only the assigned professor can decline
    professor = db.query(Professor).filter(
        Professor.user_id == current_user.id
    ).first()

    if not professor or appointment.professor_id != professor.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to decline this appointment")

    if appointment.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Appointment is already '{appointment.status}' and cannot be declined"
        )

    # Decline it
    appointment.status = "declined"
    db.commit()
    db.refresh(appointment)

    return {
        "message": "Appointment declined successfully",
        "appointment_id": appointment.id,
        "date": str(appointment.date),
        "start_time": appointment.start_time.strftime("%H:%M"),
        "end_time": appointment.end_time.strftime("%H:%M"),
        "student_id": appointment.student_id,
        "status": appointment.status
    }

@router.post("/appointments/cancel/{appointment_id}")
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Fetch the appointment
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Only the assigned professor can cancel
    professor = db.query(Professor).filter(
        Professor.user_id == current_user.id
    ).first()

    if not professor or appointment.professor_id != professor.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this appointment")

    if appointment.status not in ["pending", "declined"]:
        raise HTTPException(
            status_code=400,
            detail=f"Appointment is already '{appointment.status}' and cannot be cancelled"
        )

    # Cancel it
    appointment.status = "cancelled"
    db.commit()
    db.refresh(appointment)

    return {
        "message": "Appointment cancelled successfully",
        "appointment_id": appointment.id,
        "date": str(appointment.date),
        "start_time": appointment.start_time.strftime("%H:%M"),
        "end_time": appointment.end_time.strftime("%H:%M"),
        "student_id": appointment.student_id,
        "status": appointment.status
    }

@router.post("/appointments/no-show-student/{appointment_id}")
def no_show_student(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Fetch the appointment
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Only the assigned professor can mark no-show
    professor = db.query(Professor).filter(
        Professor.user_id == current_user.id
    ).first()

    if not professor or appointment.professor_id != professor.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to mark no-show for this appointment")

    if appointment.status != "confirmed":
        raise HTTPException(
            status_code=400,
            detail=f"Only confirmed appointments can be marked as no-show"
        )

    # Mark it as cancelled and increment student's no-show count
    appointment.status = "no-show"
    if appointment.student_id:
        student = db.query(Student).filter(Student.user_id == appointment.student_id).first()
        if student:
            student.no_show_count += 1

    db.commit()
    db.refresh(appointment)

    return {
        "message": "Student marked as no-show and appointment cancelled",
        "appointment_id": appointment.id,
        "date": str(appointment.date),
        "start_time": appointment.start_time.strftime("%H:%M"),
        "end_time": appointment.end_time.strftime("%H:%M"),
        "student_id": appointment.student_id,
        "status": appointment.status,
        "student_no_show_count": student.no_show_count if student else None
    }