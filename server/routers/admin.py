from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd
from datetime import datetime
from database import get_db
from models.models import User, Student, Faculty, Department, Slot, Appointment
from security.oauth2 import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/admin", tags=["admin"])

import random
import string
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class DepartmentBase(BaseModel):
    name: str

class FacultyBase(BaseModel):
    name: str
    email: str
    department_id: int
    designation: Optional[str] = None
    office: Optional[str] = None

class StudentBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    roll_number: Optional[str] = None
    programme: Optional[str] = None
    year: Optional[int] = None


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
            name=str(name).strip(),
            password=hashed_password,
            role="faculty"
        )
        db.add(user)
        db.flush()

        faculty = Faculty(
            user_id=user.id,
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
            name=str(name).strip(),
            password=hashed_password,
            role="student"
        )
        db.add(user)
        db.flush()

        student = Student(
            user_id=user.id,
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
    
@router.get("/departments")
def get_departments(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(Department).all()

@router.post("/departments")
def create_department(data: DepartmentBase, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    new_dept = Department(name=data.name)
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return new_dept

@router.put("/departments/{dept_id}")
def update_department(dept_id: int, data: DepartmentBase, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
        
    dept.name = data.name
    db.commit()
    db.refresh(dept)
    return dept

@router.delete("/departments/{dept_id}")
def delete_department(dept_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
        
    db.delete(dept)
    db.commit()
    return {"message": "Department deleted successfully"}

# ==========================================
# 3. FACULTY ENDPOINTS
# ==========================================

@router.get("/faculties")
def get_faculties(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Join User and Faculty tables to return complete info
    faculties = db.query(User, Faculty).join(Faculty, User.id == Faculty.user_id).all()
    
    result = []
    for user, faculty in faculties:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "department_id": faculty.department_id,
            "designation": faculty.designation,
            "office": faculty.office
        })
    return result

@router.post("/faculties")
def create_faculty(data: FacultyBase, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    raw_password = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
    
    new_user = User(
        email=data.email,
        name=data.name,
        password=pwd_context.hash(raw_password),
        role="faculty"
    )
    db.add(new_user)
    db.flush() # Get user ID without fully committing
    
    new_faculty = Faculty(
        user_id=new_user.id,
        department_id=data.department_id,
        designation=data.designation,
        office=data.office
    )
    db.add(new_faculty)
    db.commit()
    
    return {"message": "Faculty created successfully", "password": raw_password , "id": new_user.id}

@router.put("/faculties/{user_id}")
def update_faculty(user_id: int, data: FacultyBase, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    user = db.query(User).filter(User.id == user_id, User.role == "faculty").first()
    faculty = db.query(Faculty).filter(Faculty.user_id == user_id).first()
    
    if not user or not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
        
    user.name = data.name
    user.email = data.email
    faculty.department_id = data.department_id
    faculty.designation = data.designation
    faculty.office = data.office
    
    db.commit()
    return {"message": "Faculty updated successfully"}

@router.delete("/faculties/{user_id}")
def delete_faculty(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Faculty not found")
        
    # Deleting the user should cascade to delete the faculty row (if set up in models)
    # But explicitly deleting both is safer
    db.query(Slot).filter(Slot.faculty_id == user_id).delete()
    db.query(Faculty).filter(Faculty.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    
    return {"message": "Faculty deleted successfully"}

# ==========================================
# 4. STUDENT ENDPOINTS
# ==========================================

@router.get("/students")
def get_students(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    students = db.query(User, Student).join(Student, User.id == Student.user_id).all()
    
    result = []
    for user, student in students:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": student.phone,
            "roll_number": student.roll_number,
            "programme": student.programme,
            "year": student.year
        })
    return result

@router.post("/students")
def create_student(data: StudentBase, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Auto-parse roll number from email if they didn't provide one
    roll_number = data.roll_number
    programme = data.programme
    year = data.year
    
    if not roll_number:
        parsed_roll, parsed_prog, parsed_year = parse_roll_number(data.email)
        roll_number = parsed_roll
        programme = parsed_prog or programme
        year = parsed_year or year

    hashed_password = pwd_context.hash(roll_number) if roll_number else pwd_context.hash("changeme")
    
    new_user = User(
        email=data.email,
        name=data.name,
        password=hashed_password,
        role="student"
    )
    db.add(new_user)
    db.flush() 
    
    new_student = Student(
        user_id=new_user.id,
        phone=data.phone or "",
        roll_number=roll_number,
        programme=programme,
        year=year
    )
    db.add(new_student)
    db.commit()
    
    return {"message": "Student created successfully"}

@router.put("/students/{user_id}")
def update_student(user_id: int, data: StudentBase, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    user = db.query(User).filter(User.id == user_id, User.role == "student").first()
    student = db.query(Student).filter(Student.user_id == user_id).first()
    
    if not user or not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    user.name = data.name
    user.email = data.email
    student.phone = data.phone if data.phone is not None else student.phone
    student.roll_number = data.roll_number if data.roll_number is not None else student.roll_number
    student.programme = data.programme if data.programme is not None else student.programme
    student.year = data.year if data.year is not None else student.year
    
    db.commit()
    return {"message": "Student updated successfully"}

@router.delete("/students/{user_id}")
def delete_student(user_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
        
    db.query(Student).filter(Student.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    
    return {"message": "Student deleted successfully"}


@router.get("/appointments")
def get_appointments(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    appointments = db.query(Appointment).all()
    
    result = []
    for appt in appointments:
        result.append({
            "id": appt.id,
            "booker": appt.booker.name if appt.booker else None,
            "booker_email": appt.booker.email if appt.booker else None,
            "date": appt.date.isoformat() if appt.date else None,
            "start_time": appt.start_time.strftime("%H:%M") if appt.start_time else None,
            "end_time": appt.end_time.strftime("%H:%M") if appt.end_time else None,
            "purpose": appt.purpose,
            "status": appt.status,
        })
    return result