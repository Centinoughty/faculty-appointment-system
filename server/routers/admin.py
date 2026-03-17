from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd
from datetime import datetime
from database import get_db
from models.models import User, Student, Professor, Department, Slot,Appointment

from security.oauth2 import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/upload-professors")
async def upload_professors(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    # Only admin allowed
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Read Excel file
    df = pd.read_csv(file.file)

    created = []

    for _, row in df.iterrows():
        email = row["email"]
        name = row["name"]
        department_id = row["department_id"]

        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            continue

        # Create user
        user = User(
            email=email,
            role="professor"
        )

        db.add(user)
        db.flush()  # to get user.id

        # Create professor
        professor = Professor(
            user_id=user.id,
            name=name,
            department_id=department_id
        )

        db.add(professor)
        created.append(email)

    db.commit()

    return {
        "message": "Professors uploaded successfully",
        "created_professors": created
    }


@router.post("/upload-students")
async def upload_students(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Only admin allowed
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Read Excel file
    df = pd.read_csv(file.file)

    required_cols = {"email", "name"}
    if not required_cols.issubset(set(df.columns.str.lower())):
        raise HTTPException(status_code=400, detail="Excel must contain columns: email, name (phone, semester optional)")

    created = []

    for _, row in df.iterrows():
        email = row.get("email") or row.get("Email") or row.get("EMAIL")
        name = row.get("name") or row.get("Name") or row.get("NAME")
        phone = row.get("phone") or row.get("Phone") or row.get("PHONE")
        semester = row.get("semester") or row.get("Semester") or row.get("SEMESTER")

        if not email or not name:
            continue

        email = str(email).strip().lower()
        if not email:
            continue

        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            continue

        user = User(
            email=email,
            role="student"
        )
        db.add(user)
        db.flush()

        student = Student(
            user_id=user.id,
            name=str(name).strip(),
            phone=str(phone).strip() if phone is not None else "",
            semester=str(semester).strip() if semester is not None else ""
        )
        db.add(student)
        created.append(email)

    db.commit()

    return {
        "message": "Students uploaded successfully",
        "created_students": created
    }
@router.post("/faculty/upload-slots")
async def upload_slots(
    file: UploadFile = File(...),
    professor_id: int = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    if professor_id is None:
        raise HTTPException(status_code=400, detail="professor_id query parameter is required")

    professor = db.query(Professor).filter(Professor.user_id == professor_id).first()
    if not professor:
        raise HTTPException(status_code=404, detail="Professor not found")

    df = pd.read_csv(file.file, header=None)  # no header, row index = day

    created_slots = []

    for row_index, row in df.iterrows():
        day = row_index  # 0=Mon, 1=Tue, etc.

        if day > 4:  # only Mon-Fri
            continue

        for cell in row:
            if pd.isna(cell) or str(cell).strip() == "":
                continue

            cell = str(cell).strip()  # e.g. "09:00-10:00"

            try:
                start_str, end_str = cell.split("-")
                start_time = datetime.strptime(start_str.strip(), "%H:%M").time()
                end_time = datetime.strptime(end_str.strip(), "%H:%M").time()
            except ValueError:
                continue  # skip malformed cells

            slot = Slot(
                professor_id=professor_id,
                day=day,
                start_time=start_time,
                end_time=end_time,
            )
            db.add(slot)
            created_slots.append(f"Day {day}: {start_str}-{end_str}")

    db.commit()

    return {
        "message": "Slots uploaded successfully",
        "created_slots": created_slots
    }

