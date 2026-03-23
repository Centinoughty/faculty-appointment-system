from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, BackgroundTasks
from datetime import date, time, timedelta, datetime

from sqlalchemy.orm import Session
from sqlalchemy import case

from database import get_db
from models.models import User, Student, Faculty, Department, Slot, Appointment
from routers.notifications import create_notification

from security.oauth2 import get_current_user
from schemas.faculty import FacultyProfileUpdate, MarkUnavailableRequest, TimetableSave, DeclineRequest
from websocket_manager import ws_manager

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
    current_user=Depends(require_faculty)
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


@router.put("/profile")
def update_profile(
    body: FacultyProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty),
):
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty profile not found.")

    # name lives on User now
    if body.name is not None:
        user = db.query(User).filter(User.id == current_user.id).first()
        user.name = body.name
    if body.designation is not None:
        faculty.designation = body.designation
    if body.office is not None:
        faculty.office = body.office

    db.commit()
    db.refresh(faculty)

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

@router.post("/mark-unavailable")
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


@router.get("/appointments/pending")
def get_pending_appointments(
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty)
):
    appointments = db.query(Appointment).filter(
        Appointment.faculty_id == current_user.id,
        Appointment.status == "pending"
    ).order_by(
        Appointment.date.asc(),
        Appointment.start_time.asc()
    ).all()

    return [
        {
            "id": appt.id,
            "student_id": appt.booker_id,
            "student_name": appt.booker.name if appt.booker else "Unknown",
            "professor_id": appt.faculty_id,
            "professor_name": appt.faculty.user.name if appt.faculty else "Unknown",
            "date": str(appt.date),
            "time": appt.start_time.strftime("%H:%M"),
            "start_time": appt.start_time.strftime("%H:%M"),
            "end_time": appt.end_time.strftime("%H:%M"),
            "purpose": appt.purpose or "",
            "description": "",
            "status": appt.status,
            "rejection_reason": None
        }
        for appt in appointments
    ]


@router.get("/appointments/approved")
def get_approved_appointments(
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty)
):
    appointments = db.query(Appointment).filter(
        Appointment.faculty_id == current_user.id,
        Appointment.status == "approved"
    ).order_by(
        Appointment.date.asc(),
        Appointment.start_time.asc()
    ).all()

    return [
        {
            "id": appt.id,
            "student_id": appt.booker_id,
            "student_name": appt.booker.name if appt.booker else "Unknown",
            "professor_id": appt.faculty_id,
            "professor_name": appt.faculty.user.name if appt.faculty else "Unknown",
            "date": str(appt.date),
            "time": appt.start_time.strftime("%H:%M"),
            "start_time": appt.start_time.strftime("%H:%M"),
            "end_time": appt.end_time.strftime("%H:%M"),
            "purpose": appt.purpose or "",
            "description": "",
            "status": appt.status,
            "rejection_reason": None
        }
        for appt in appointments
    ]


@router.get("/appointments/blocked")
def get_blocked_slots(
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty)
):
    appointments = db.query(Appointment).filter(
        Appointment.faculty_id == current_user.id,
        Appointment.status == "blocked"
    ).order_by(
        Appointment.date.asc(),
        Appointment.start_time.asc()
    ).all()

    return [
        {
            "id": appt.id,
            "date": appt.date.isoformat(),
            "start_time": appt.start_time.strftime("%H:%M"),
            "end_time": appt.end_time.strftime("%H:%M"),
            "hour": appt.start_time.hour,
            "purpose": appt.purpose,
            "slot_type": "busy",
        }
        for appt in appointments
    ]

@router.delete("/appointments/blocked/{appointment_id}")
def delete_blocked_slot(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty)
):
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.faculty_id == current_user.id,
        Appointment.status == "blocked"
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Blocked slot not found")
    
    db.delete(appointment)
    db.commit()
    return {"message": "Blocked slot removed"}


@router.put("/appointments/approve/{appointment_id}")
def confirm_appointment(
    appointment_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.faculty_id != current_user.id:
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

    clashing_slot = db.query(Slot).filter(
        Slot.faculty_id == current_user.id,
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

    clashing_appt = db.query(Appointment).filter(
        Appointment.faculty_id == current_user.id,
        Appointment.date == appt_date,
        Appointment.id != appointment_id,
        Appointment.status.in_(["approved", "blocked"]),
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

    appointment.status = "approved"
    db.commit()
    db.refresh(appointment)

    # Auto-deny overlapping pending requests
    other_pending = db.query(Appointment).filter(
        Appointment.faculty_id == current_user.id,
        Appointment.date == appt_date,
        Appointment.id != appointment_id,
        Appointment.status == "pending",
        Appointment.start_time < appt_end,
        Appointment.end_time > appt_start
    ).all()

    for pending_appt in other_pending:
        pending_appt.status = "rejected"
        db.add(pending_appt)
        
        student_user_pending = db.query(User).filter(User.id == pending_appt.booker_id).first()
        if student_user_pending:
            create_notification(
                db=db,
                user_id=pending_appt.booker_id,
                type="appointment_declined",
                title="Appointment Declined",
                message=f"Your appointment request with {current_user.name} for {pending_appt.date} at {pending_appt.start_time.strftime('%H:%M')} was declined automatically (Slot became full).",
                email=student_user_pending.email
            )
            background_tasks.add_task(
                ws_manager.send_personal_message,
                {"type": "REFRESH_STATUS"},
                pending_appt.booker_id
            )
            
    db.commit()

    student_user = db.query(User).filter(User.id == appointment.booker_id).first()
    create_notification(
        db=db,
        user_id=appointment.booker_id,
        type="appointment_confirmed",
        title="Appointment Confirmed",
        message=f"Your appointment with {current_user.name} on {appointment.date} at {appointment.start_time.strftime('%H:%M')} has been confirmed.",
        email=student_user.email if student_user else None
    )

    background_tasks.add_task(
        ws_manager.send_personal_message,
        {"type": "REFRESH_STATUS"},
        appointment.booker_id
    )

    return {
        "message": "Appointment confirmed successfully",
        "appointment_id": appointment.id,
        "date": str(appointment.date),
        "start_time": appointment.start_time.strftime("%H:%M"),
        "end_time": appointment.end_time.strftime("%H:%M"),
        "booker_id": appointment.booker_id,
        "status": appointment.status
    }


@router.put("/appointments/decline/{appointment_id}")
def decline_appointment(
    appointment_id: int,
    body: DeclineRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.faculty_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to decline this appointment")

    if appointment.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Appointment is already '{appointment.status}' and cannot be declined"
        )

    appointment.status = "rejected"
    if body.reason:
        appointment.rejection_reason = body.reason
        
    db.commit()
    db.refresh(appointment)

    student_user = db.query(User).filter(User.id == appointment.booker_id).first()
    create_notification(
        db=db,
        user_id=appointment.booker_id,
        type="appointment_declined",
        title="Appointment Declined",
        message=f"Your appointment request with {current_user.name} for {appointment.date} was declined." + (f" Reason: {body.reason}" if body.reason else ""),
        email=student_user.email if student_user else None
    )

    background_tasks.add_task(
        ws_manager.send_personal_message,
        {"type": "REFRESH_STATUS"},
        appointment.booker_id
    )

    return {
        "message": "Appointment declined successfully",
        "appointment_id": appointment.id,
        "date": str(appointment.date),
        "start_time": appointment.start_time.strftime("%H:%M"),
        "end_time": appointment.end_time.strftime("%H:%M"),
        "booker_id": appointment.booker_id,
        "status": appointment.status
    }


@router.put("/appointments/cancel/{appointment_id}")
def cancel_appointment(
    appointment_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.faculty_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this appointment")

    if appointment.status not in ["pending", "approved"]:
        raise HTTPException(
            status_code=400,
            detail=f"Appointment is already '{appointment.status}' and cannot be cancelled"
        )

    appointment.status = "cancelled"
    db.commit()
    db.refresh(appointment)

    background_tasks.add_task(
        ws_manager.send_personal_message,
        {"type": "REFRESH_STATUS"},
        appointment.booker_id
    )

    return {
        "message": "Appointment cancelled successfully",
        "appointment_id": appointment.id,
        "date": str(appointment.date),
        "start_time": appointment.start_time.strftime("%H:%M"),
        "end_time": appointment.end_time.strftime("%H:%M"),
        "booker_id": appointment.booker_id,
        "status": appointment.status
    }



@router.put("/appointments/complete/{appointment_id}")
def complete_appointment(
    appointment_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.faculty_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to complete this appointment")

    if appointment.status != "approved":
        raise HTTPException(
            status_code=400,
            detail="Only approved appointments can be marked as completed"
        )

    appointment.status = "completed"
    db.commit()
    db.refresh(appointment)
    
    background_tasks.add_task(
        ws_manager.send_personal_message,
        {"type": "REFRESH_STATUS"},
        appointment.booker_id
    )

    return {
        "message": "Appointment marked as completed",
        "appointment_id": appointment.id,
        "status": appointment.status
    }


@router.put("/appointments/no-show/{appointment_id}")
def no_show_student(
    appointment_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.faculty_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to mark no-show for this appointment")

    if appointment.status != "approved":
        raise HTTPException(
            status_code=400,
            detail="Only approved appointments can be marked as no-show"
        )

    appointment.status = "no-show"

    student = None
    if appointment.booker_id:
        booker = db.query(User).filter(User.id == appointment.booker_id).first()
        if booker and booker.role == "student":
            student = db.query(Student).filter(Student.user_id == booker.id).first()
            if student:
                student.no_show_count += 1

    db.commit()
    db.refresh(appointment)

    background_tasks.add_task(
        ws_manager.send_personal_message,
        {"type": "REFRESH_STATUS"},
        appointment.booker_id
    )

    return {
        "message": "Student marked as no-show",
        "appointment_id": appointment.id,
        "status": appointment.status,
    }


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


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty)
):
    base = db.query(Appointment).filter(
        Appointment.faculty_id == current_user.id,
        Appointment.status != "blocked"
    )
    return {
        "total": base.count(),
        "pending": base.filter(Appointment.status == "pending").count(),
        "confirmed": base.filter(Appointment.status == "approved").count(), 
        "declined": base.filter(Appointment.status == "rejected").count(),
        "completed": base.filter(Appointment.status == "completed").count(),
        "cancelled": base.filter(Appointment.status == "cancelled").count(),
        "no-show": base.filter(Appointment.status == "no-show").count(),
    }

@router.get("/timetable")
def get_timetable(
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty)
):
    slots = db.query(Slot).filter(Slot.faculty_id == current_user.id).all()
    entries = []
    for slot in slots:
        entries.append({
            "day_of_week": slot.day,
            "hour": slot.start_time.hour,
            "subject": "Office Hours"
        })
    return entries

@router.post("/timetable")
def save_timetable(
    body: TimetableSave,
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty)
):
    db.query(Slot).filter(Slot.faculty_id == current_user.id).delete()
    
    new_slots = []
    for entry in body.entries:
        slot = Slot(
            faculty_id=current_user.id,
            day=entry.day_of_week,
            start_time=time(entry.hour, 0),
            end_time=time(entry.hour + 1, 0)
        )
        new_slots.append(slot)
    
    db.add_all(new_slots)
    db.commit()
    return get_timetable(db=db, current_user=current_user)