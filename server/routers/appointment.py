from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date, time, timedelta
from database import get_db
from models.models import User, Student, Faculty, Department, Slot, Appointment
from security.oauth2 import get_current_user
from schemas.student import BookAppointmentRequest

from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")


def require_faculty(current_user=Depends(get_current_user)):
    if current_user is None or current_user.role != "faculty":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to faculty only."
        )
    return current_user

router = APIRouter(prefix="/api", tags=["Student"])

@router.post("/appointment")
def book_appointment(
    body: BookAppointmentRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "student":
        print("0")
        raise HTTPException(status_code=403, detail="Not authorized")

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        print("1")
        raise HTTPException(status_code=404, detail="Student not found")

    faculty_id = body.facultyId
    faculty = db.query(Faculty).filter(Faculty.user_id == faculty_id).first()
    if not faculty:
        print("2")
        raise HTTPException(status_code=404, detail="Faculty not found")

    if faculty.busy:
        print("3")
        raise HTTPException(status_code=400, detail="Faculty is currently unavailable for appointments")

    appointment_date = body.date.astimezone(IST).date()
    start_time = datetime.strptime(body.startTime, "%H:%M").time()

    print(f"appointment_date: {appointment_date}")
    print(f"start_time: {start_time}")

    total_minutes = start_time.hour * 60 + start_time.minute
    if total_minutes % 30 != 0:
        print("4")
        raise HTTPException(status_code=400, detail="Appointments can only start at 30-minute boundaries (e.g. 9:00, 9:30, 10:00)")

    end_time = (datetime.combine(appointment_date, start_time) + timedelta(minutes=30)).time()
    day_of_week = appointment_date.weekday()

    print(f"end_time: {end_time}, day_of_week: {day_of_week}")

    conflicting_slot = db.query(Slot).filter(
        Slot.faculty_id == faculty_id,
        Slot.day == day_of_week,
        Slot.start_time < end_time,
        Slot.end_time > start_time
    ).first()

    if conflicting_slot:
        print("5")
        raise HTTPException(status_code=400, detail="No available slot for faculty at this time")

    conflicting_appointment = db.query(Appointment).filter(
        Appointment.faculty_id == faculty_id,
        Appointment.date == appointment_date,
        Appointment.status.in_(["approved", "blocked"]),
        Appointment.start_time < end_time,
        Appointment.end_time > start_time
    ).first()

    if conflicting_appointment:
        print("6")
        raise HTTPException(status_code=400, detail="Time slot is not available")

    appointment = Appointment(
        faculty_id=faculty_id,
        date=appointment_date,
        start_time=start_time,
        end_time=end_time,
        booker_id=current_user.id,
        purpose=body.purpose,
        description=body.description,
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

    appointments = db.query(Appointment).filter(Appointment.booker_id == current_user.id).all()

    return [
        {
            "id": appt.id,
            "faculty": {
                "id": appt.faculty.user_id,
                "name": appt.faculty.user.name,
                "email": appt.faculty.user.email,
                "department": {
                    "id": appt.faculty.department.id,
                    "name": appt.faculty.department.name
                } if appt.faculty.department else None,
                "picture": appt.faculty.user.picture,
            } if appt.faculty else None,
            "date": appt.date.isoformat(),
            "start_time": appt.start_time.strftime("%H:%M"),
            "end_time": appt.end_time.strftime("%H:%M"),
            "purpose": appt.purpose,
            "description": appt.description,
            "status": appt.status,
        }
        for appt in appointments
    ]


@router.patch("/appointment/{appointmentId}/approve")
def confirm_appointment(
    appointmentId: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_faculty)
):  
    appointment = db.query(Appointment).filter(Appointment.id == appointmentId).first()
    if not appointment:
        print("1")
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.faculty_id != current_user.id:
        print("2")
        raise HTTPException(status_code=403, detail="Not authorized to confirm this appointment")

    if appointment.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Appointment is already '{appointment.status}' and cannot be confirmed"
        )

    appt_date = appointment.date
    appt_start = appointment.start_time
    appt_end = appointment.end_time

    clashing_appt = db.query(Appointment).filter(
        Appointment.faculty_id == current_user.id,
        Appointment.date == appt_date,
        Appointment.id != appointmentId,  # fixed typo
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

    return {
        "message": "Appointment confirmed successfully",
        "appointment_id": appointment.id,
        "date": str(appointment.date),
        "start_time": appointment.start_time.strftime("%H:%M"),
        "end_time": appointment.end_time.strftime("%H:%M"),
        "booker_id": appointment.booker_id,
        "status": appointment.status
    }


@router.patch("/appointment/{appointment_id}/decline")
def decline_appointment(
    appointment_id: int,
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
    db.commit()
    db.refresh(appointment)

    return {
        "message": "Appointment declined successfully",
        "appointment_id": appointment.id,
        "date": str(appointment.date),
        "start_time": appointment.start_time.strftime("%H:%M"),
        "end_time": appointment.end_time.strftime("%H:%M"),
        "booker_id": appointment.booker_id,
        "status": appointment.status
    }


@router.patch("/appointment/{appointment_id}/cancel")
def cancel_appointment(
    appointment_id: int,
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

    return {
        "message": "Appointment cancelled successfully",
        "appointment_id": appointment.id,
        "date": str(appointment.date),
        "start_time": appointment.start_time.strftime("%H:%M"),
        "end_time": appointment.end_time.strftime("%H:%M"),
        "booker_id": appointment.booker_id,
        "status": appointment.status
    }


@router.patch("/appointment/{appointment_id}/no-show")
def no_show_student(
    appointment_id: int,
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

    return {
        "message": "Student marked as no-show",
        "appointment_id": appointment.id,
        "date": str(appointment.date),
        "start_time": appointment.start_time.strftime("%H:%M"),
        "end_time": appointment.end_time.strftime("%H:%M"),
        "booker_id": appointment.booker_id,
        "status": appointment.status,
        "student_no_show_count": student.no_show_count if student else None
    }

