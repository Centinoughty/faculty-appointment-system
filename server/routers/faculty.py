from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.models import (
    Appointment, Professor, Student, Department,
    AvailabilitySlot, TimetableEntry, TimetableExemption
)
from schemas.appointment import AppointmentOut, AppointmentStatusUpdate, FacultyStats
from schemas.faculty import FacultyProfileOut, FacultyProfileUpdate
from schemas.availability import AvailabilitySlotCreate, AvailabilitySlotOut
from schemas.timetable import (
    TimetableSave, TimetableEntryOut,
    TimetableExemptionCreate, TimetableExemptionOut
)
from security.oauth2 import get_current_user

router = APIRouter(prefix="/api/faculty", tags=["Faculty"])


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

def _enrich_appointment(appt: Appointment, db: Session) -> dict:
    """Attach student_name and professor_name to an appointment dict."""
    student = db.query(Student).filter(Student.user_id == appt.student_id).first()
    prof = db.query(Professor).filter(Professor.user_id == appt.professor_id).first()
    d = {c.name: getattr(appt, c.name) for c in appt.__table__.columns}
    d["student_name"] = student.name if student else "Unknown"
    d["professor_name"] = prof.name if prof else "Unknown"
    return d


@router.get("/appointments", response_model=List[AppointmentOut])
def get_appointments(
    db: Session = Depends(get_db),
    current_user=Depends(require_professor)
):
    """List all appointments for the logged-in professor."""
    appointments = db.query(Appointment).filter(
        Appointment.professor_id == current_user.id
    ).order_by(Appointment.date.desc(), Appointment.time).all()

    return [_enrich_appointment(a, db) for a in appointments]


@router.get("/stats", response_model=FacultyStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user=Depends(require_professor)
):
    """Return appointment count stats for the logged-in professor."""
    base = db.query(Appointment).filter(Appointment.professor_id == current_user.id)

    return {
        "total":     base.count(),
        "pending":   base.filter(Appointment.status == "pending").count(),
        "confirmed": base.filter(Appointment.status == "confirmed").count(),
        "declined":  base.filter(Appointment.status == "declined").count(),
        "completed": base.filter(Appointment.status == "completed").count(),
    }


@router.patch("/appointments/{appointment_id}/status", response_model=AppointmentOut)
def update_appointment_status(
    appointment_id: int,
    body: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_professor)
):
    """
    Approve, decline, cancel, or mark an appointment as completed.
    Allowed statuses: confirmed | declined | cancelled | completed
    """
    allowed = {"confirmed", "declined", "cancelled", "completed"}
    if body.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{body.status}'. Must be one of: {allowed}"
        )

    appt = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.professor_id == current_user.id
    ).first()

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    appt.status = body.status
    if body.rejection_reason is not None:
        appt.rejection_reason = body.rejection_reason

    db.commit()
    db.refresh(appt)
    return _enrich_appointment(appt, db)


@router.delete("/appointments/{appointment_id}")
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_professor)
):
    """Hard-cancel (set status to 'cancelled') a faculty-owned appointment."""
    appt = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.professor_id == current_user.id
    ).first()

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    appt.status = "cancelled"
    db.commit()
    return {"message": "Appointment cancelled successfully."}


# ---------------------------------------------------------------------------
# Availability Slots
# ---------------------------------------------------------------------------

@router.get("/availability", response_model=List[AvailabilitySlotOut])
def get_availability(
    db: Session = Depends(get_db),
    current_user=Depends(require_professor)
):
    """Return all availability slots for the logged-in professor."""
    return db.query(AvailabilitySlot).filter(
        AvailabilitySlot.professor_id == current_user.id
    ).order_by(AvailabilitySlot.date, AvailabilitySlot.hour).all()


@router.post("/availability", response_model=AvailabilitySlotOut, status_code=201)
def create_availability(
    body: AvailabilitySlotCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_professor)
):
    """Add an availability (or busy) slot to the calendar."""
    slot = AvailabilitySlot(
        professor_id=current_user.id,
        date=body.date,
        hour=body.hour,
        title=body.title,
        slot_type=body.slot_type,
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


@router.delete("/availability/{slot_id}")
def delete_availability(
    slot_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_professor)
):
    """Delete a faculty-owned availability slot."""
    slot = db.query(AvailabilitySlot).filter(
        AvailabilitySlot.id == slot_id,
        AvailabilitySlot.professor_id == current_user.id
    ).first()

    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found.")

    db.delete(slot)
    db.commit()
    return {"message": "Slot deleted successfully."}


# ---------------------------------------------------------------------------
# Timetable (Recurring weekly entries)
# ---------------------------------------------------------------------------

@router.get("/timetable", response_model=List[TimetableEntryOut])
def get_timetable(
    db: Session = Depends(get_db),
    current_user=Depends(require_professor)
):
    """Return all recurring timetable entries for the logged-in professor."""
    return db.query(TimetableEntry).filter(
        TimetableEntry.professor_id == current_user.id
    ).all()


@router.post("/timetable", response_model=List[TimetableEntryOut])
def save_timetable(
    body: TimetableSave,
    db: Session = Depends(get_db),
    current_user=Depends(require_professor)
):
    """
    Atomically replace all timetable entries for this professor.
    Sends the full grid from the frontend Timetable Configuration modal.
    """
    # Delete all existing entries first
    db.query(TimetableEntry).filter(
        TimetableEntry.professor_id == current_user.id
    ).delete()

    # Insert fresh entries
    new_entries = [
        TimetableEntry(
            professor_id=current_user.id,
            day_of_week=entry.day_of_week,
            hour=entry.hour,
            subject=entry.subject,
        )
        for entry in body.entries
    ]
    db.add_all(new_entries)
    db.commit()

    return db.query(TimetableEntry).filter(
        TimetableEntry.professor_id == current_user.id
    ).all()


# ---------------------------------------------------------------------------
# Timetable Exemptions (per-date class cancellations)
# ---------------------------------------------------------------------------

@router.get("/timetable/exemptions", response_model=List[TimetableExemptionOut])
def get_exemptions(
    db: Session = Depends(get_db),
    current_user=Depends(require_professor)
):
    """Return all timetable exemptions (date-level cancellations)."""
    return db.query(TimetableExemption).filter(
        TimetableExemption.professor_id == current_user.id
    ).all()


@router.post("/timetable/exemptions", response_model=TimetableExemptionOut, status_code=201)
def create_exemption(
    body: TimetableExemptionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_professor)
):
    """Cancel a specific instance of a recurring class (exemption)."""
    # Prevent duplicates
    existing = db.query(TimetableExemption).filter(
        TimetableExemption.professor_id == current_user.id,
        TimetableExemption.date == body.date,
        TimetableExemption.hour == body.hour,
    ).first()

    if existing:
        return existing   # Idempotent — return the existing exemption

    exemption = TimetableExemption(
        professor_id=current_user.id,
        date=body.date,
        hour=body.hour,
    )
    db.add(exemption)
    db.commit()
    db.refresh(exemption)
    return exemption


@router.delete("/timetable/exemptions/{exemption_id}")
def delete_exemption(
    exemption_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_professor)
):
    """Remove an exemption (restore the cancelled class)."""
    exemption = db.query(TimetableExemption).filter(
        TimetableExemption.id == exemption_id,
        TimetableExemption.professor_id == current_user.id
    ).first()

    if not exemption:
        raise HTTPException(status_code=404, detail="Exemption not found.")

    db.delete(exemption)
    db.commit()
    return {"message": "Exemption removed — class restored."}
