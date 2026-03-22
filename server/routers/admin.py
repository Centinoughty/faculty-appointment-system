from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd
from datetime import datetime
from database import get_db
from models.models import User, Student, Faculty, Department, Slot, Appointment
from security.oauth2 import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])

import random
import string
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/upload-faculty")
async def upload_faculty(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    df = pd.read_csv(file.file)

    created = []

    for _, row in df.iterrows():
        email = row.get("email") or row.get("Email") or row.get("EMAIL")
        name = row.get("name") or row.get("Name") or row.get("NAME")
        department_id = row.get("department_id") or row.get("Department_id") or row.get("DEPARTMENT_ID")

        if not email or not name or not department_id:
            continue

        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            continue

        raw_password = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
        hashed_password = pwd_context.hash(raw_password)

        user = User(
            email=email,
            password=hashed_password,
            role="faculty"
        )
        db.add(user)
        db.flush()

        faculty = Faculty(
            user_id=user.id,
            name=name,
            department_id=department_id,
            designation=row.get("designation"),
            office=row.get("office")
        )
        db.add(faculty)
        created.append({"email": email, "password": raw_password})

    db.commit()

    return {
        "message": "Faculty uploaded successfully",
        "created_faculty": created
    }


def parse_roll_number(email: str):
    try:
        local = email.split("@")[0]
        code = local.split("_")[1].upper()

        prefix = code[0]
        year = int("20" + code[1:3])

        programme_map = {
            "B": "btech",
            "M": "mtech",
            "P": "phd"
        }
        programme = programme_map.get(prefix)

        return code, programme, year
    except Exception:
        return None, None, None


@router.post("/upload-students")
async def upload_students(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    df = pd.read_csv(file.file)

    required_cols = {"email", "name"}
    if not required_cols.issubset(set(df.columns.str.lower())):
        raise HTTPException(status_code=400, detail="CSV must contain columns: email, name (phone optional)")

    created = []

    for _, row in df.iterrows():
        email = row.get("email") or row.get("Email") or row.get("EMAIL")
        name = row.get("name") or row.get("Name") or row.get("NAME")
        phone = row.get("phone") or row.get("Phone") or row.get("PHONE")

        if not email or not name:
            continue

        email = str(email).strip().lower()
        if not email:
            continue

        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            continue

        roll_number, programme, year = parse_roll_number(email)

        hashed_password = pwd_context.hash(roll_number) if roll_number else pwd_context.hash("changeme")

        user = User(
            email=email,
            password=hashed_password,
            role="student"
        )
        db.add(user)
        db.flush()

        student = Student(
            user_id=user.id,
            name=str(name).strip(),
            phone=str(phone).strip() if phone is not None else "",
            roll_number=roll_number,
            programme=programme,
            year=year
        )
        db.add(student)
        created.append({"email": email, "roll_number": roll_number, "programme": programme, "year": year})

    db.commit()

    return {
        "message": "Students uploaded successfully",
        "created_students": created
    }


@router.post("/faculty/upload-slots")
async def upload_slots(
    file: UploadFile = File(...),
    faculty_id: int = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    if faculty_id is None:
        raise HTTPException(status_code=400, detail="faculty_id query parameter is required")

    faculty = db.query(Faculty).filter(Faculty.user_id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")

    db.query(Slot).filter(Slot.faculty_id == faculty_id).delete()

    df = pd.read_csv(file.file, header=None)

    created_slots = []

    for row_index, row in df.iterrows():
        day = row_index

        if day > 4:
            continue

        for cell in row:
            if pd.isna(cell) or str(cell).strip() == "":
                continue

            cell = str(cell).strip()

            try:
                start_str, end_str = cell.split("-")
                start_time = datetime.strptime(start_str.strip(), "%H:%M").time()
                end_time = datetime.strptime(end_str.strip(), "%H:%M").time()
            except ValueError:
                continue

            slot = Slot(
                faculty_id=faculty_id,
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