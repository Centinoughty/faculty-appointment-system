from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse
import io
import csv
from sqlalchemy.orm import Session
import pandas as pd
from datetime import datetime
from database import get_db
from models.models import User, Student, Faculty, Department, Slot, Appointment
from security.oauth2 import get_current_user
from pydantic import BaseModel
from typing import Optional, List
from database import get_db, SessionLocal
from services.timetable_automator import run_semester_setup
import os

router = APIRouter(prefix="/api/admin", tags=["admin"])

import random
import string
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class DepartmentBase(BaseModel):
    name: str
    hod_id: Optional[int] = None

class FacultyBase(BaseModel):
    name: str
    email: str
    department_id: int
    designation: Optional[str] = None
    office: Optional[str] = None
    short_code: Optional[str] = None

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

    try:
        # Read the file content to handle BOM and positioning
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents), encoding='utf-8-sig')
        # Normalize columns: lowercase and stripped
        df.columns = [c.lower().strip() for c in df.columns]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read CSV file: {str(e)}")

    # Check for required columns
    required_cols = {"email", "name"}
    actual_cols = set(df.columns)
    if not any(col in actual_cols for col in ["department", "department_id"]):
         raise HTTPException(status_code=400, detail="CSV must contain a 'department' or 'department_id' column")
    if not required_cols.issubset(actual_cols):
         raise HTTPException(status_code=400, detail=f"CSV must contain 'email' and 'name' columns. Found: {actual_cols}")

    created = []
    skipped = []
    
    # Pre-fetch departments and build mapping for smart matching
    all_depts = db.query(Department).all()
    dept_id_set = {d.id for d in all_depts}
    
    # Map lowercase name -> ID
    dept_name_map = {d.name.lower().strip(): d.id for d in all_depts}
    
    # Map initials -> ID (e.g., "CSE" -> "Computer Science and Engineering")
    dept_initials_map = {}
    for d in all_depts:
        clean_name = d.name.lower().replace("&", "and")
        words = [w for w in clean_name.split() if w not in ['and', 'of', 'for', 'the']]
        initials = "".join([w[0] for w in words if w])
        if initials:
            dept_initials_map[initials] = d.id

    for index, row in df.iterrows():
        email = str(row.get("email", "")).strip().lower()
        name = str(row.get("name", "")).strip()
        dept_raw = str(row.get("department", row.get("department_id", ""))).strip()
        dept_key = dept_raw.lower()

        if not email or not name or not dept_raw:
            skipped.append({"row": index + 2, "name": name, "reason": "Missing required fields"})
            continue

        # Smart Department Resolution
        resolved_dept_id = None
        
        if dept_raw.isdigit() and int(dept_raw) in dept_id_set:
            resolved_dept_id = int(dept_raw)
        elif dept_key in dept_name_map:
            resolved_dept_id = dept_name_map[dept_key]
        elif dept_key in dept_initials_map:
            resolved_dept_id = dept_initials_map[dept_key]
        else:
            # Expanded Matching: Check if input starts with department initials (e.g., "CSE" starts with "CS")
            # Or if it's a fuzzy substring
            for d_name, d_id in dept_name_map.items():
                # Get initials for THIS specific department name
                words = [w for w in d_name.split() if w not in ['and', 'of', 'for', 'the', '&']]
                initials = "".join([w[0] for w in words])
                
                if (initials and (dept_key.startswith(initials) or initials.startswith(dept_key))) or dept_key in d_name:
                    resolved_dept_id = d_id
                    break
        
        if not resolved_dept_id:
            available = ", ".join([d.name for d in all_depts])
            skipped.append({
                "row": index + 2, 
                "name": name, 
                "reason": f"Department '{dept_raw}' not found. Available: [{available}]"
            })
            continue



        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            skipped.append({"row": index + 2, "name": name, "reason": "Email already exists"})
            continue

        raw_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        hashed_password = pwd_context.hash(raw_password)

        user = User(
            email=email,
            name=name,
            password=hashed_password,
            role="faculty"
        )
        db.add(user)
        db.flush()

        faculty = Faculty(
            user_id=user.id,
            department_id=resolved_dept_id,
            designation=str(row.get("designation", "")).strip() if row.get("designation") else None,
            office=str(row.get("office", "")).strip() if row.get("office") else None,
            short_code=str(row.get("short_code", "")).strip().upper() if row.get("short_code") else None
        )
        db.add(faculty)
        created.append({"email": email, "password": raw_password})

    db.commit()

    return {
        "message": f"Processed {len(df)} rows. Created {len(created)} faculties. Skipped {len(skipped)}.",
        "created_faculty": created,
        "skipped_rows": skipped
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

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents), encoding='utf-8-sig')
        df.columns = [c.lower().strip() for c in df.columns]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read CSV file: {str(e)}")

    required_cols = {"email", "name"}
    if not required_cols.issubset(set(df.columns)):
        raise HTTPException(status_code=400, detail="CSV must contain columns: email, name")

    created = []

    for _, row in df.iterrows():
        email = str(row.get("email", "")).strip().lower()
        name = str(row.get("name", "")).strip()

        if not email or not name:
            continue

        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            continue

        # Try to parse roll number from email or CSV
        roll_number_csv = str(row.get("roll_number", row.get("student_id", ""))).strip().upper()
        roll_parsed, prog_parsed, year_parsed = parse_roll_number(email)

        user = User(
            email=email,
            name=name,
            role="student"
        )
        db.add(user)
        db.flush()

        roll_number = roll_number_csv or roll_parsed or f"S_{user.id}"
        programme = prog_parsed if prog_parsed else "btech"
        year = year_parsed if year_parsed else datetime.now().year

        user.password = pwd_context.hash(roll_number.lower())

        student = Student(
            user_id=user.id,
            roll_number=roll_number,
            programme=programme,
            year=year,
            phone=str(row.get("phone", "")).strip() if pd.notna(row.get("phone")) else None
        )
        db.add(student)
        created.append({"email": email, "roll_number": roll_number})

    db.commit()

    return {
        "message": f"Successfully processed {len(df)} rows. Created {len(created)} students.",
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
    
@router.post("/upload-departments")
async def upload_departments(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents), encoding='utf-8-sig')
        df.columns = [c.lower().strip() for c in df.columns]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read CSV file: {str(e)}")

    if "name" not in df.columns:
        raise HTTPException(status_code=400, detail="CSV must contain a 'name' column")

    created = []
    skipped = []
    
    existing_depts = {d.name.lower().strip() for d in db.query(Department).all()}

    for index, row in df.iterrows():
        name = str(row.get("name", "")).strip()

        if not name:
            skipped.append({"row": index + 2, "reason": "Name is empty"})
            continue

        if name.lower() in existing_depts:
            skipped.append({"row": index + 2, "name": name, "reason": "Department already exists"})
            continue

        new_dept = Department(name=name)
        db.add(new_dept)
        created.append(name)
        existing_depts.add(name.lower())

    db.commit()

    return {
        "message": f"Processed {len(df)} rows. Created {len(created)} departments. Skipped {len(skipped)}.",
        "created_departments": created,
        "skipped_rows": skipped
    }

@router.get("/departments")
def get_departments(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    depts = db.query(Department).all()
    result = []
    for d in depts:
        # Calculate real faculty count for this department
        faculty_count = db.query(Faculty).filter(Faculty.department_id == d.id).count()
        
        result.append({
            "id": d.id,
            "name": d.name,
            "hod_id": d.hod_id,
            "hod_name": d.hod.user.name if d.hod and d.hod.user else "Not Assigned",
            "faculty_count": faculty_count
        })
    return result

@router.post("/departments")
def create_department(data: DepartmentBase, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    new_dept = Department(
        name=data.name,
        hod_id=data.hod_id
    )
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
    dept.hod_id = data.hod_id
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
            "office": faculty.office,
            "short_code": faculty.short_code,
            "busy": faculty.busy
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
        office=data.office,
        short_code=data.short_code
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
    faculty.short_code = data.short_code
    
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
            "year": student.year,
            "no_show_count": student.no_show_count
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

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    total_students = db.query(Student).count()
    total_faculties = db.query(Faculty).count()
    total_departments = db.query(Department).count()
    total_appointments = db.query(Appointment).count()
    
    # Calculate Average Response Time
    avg_response_hrs = 0
    responded_query = db.query(Appointment).filter(Appointment.responded_at != None).all()
    if responded_query:
        total_seconds = 0
        for appt in responded_query:
            diff = appt.responded_at - appt.created_at
            total_seconds += diff.total_seconds()
        
        avg_seconds = total_seconds / len(responded_query)
        avg_response_hrs = round(avg_seconds / 3600, 1)

    # Get students with no-shows (top 5 for the dashboard table)
    no_show_students = db.query(User, Student).join(Student, User.id == Student.user_id)\
        .filter(Student.no_show_count > 0)\
        .order_by(Student.no_show_count.desc())\
        .limit(5).all()
        
    no_show_list = []
    for user, student in no_show_students:
        no_show_list.append({
            "id": user.id,
            "name": user.name,
            "roll_number": student.roll_number,
            "no_show_count": student.no_show_count
        })

    return {
        "counts": {
            "students": total_students,
            "faculties": total_faculties,
            "departments": total_departments,
            "appointments": total_appointments,
            "avg_response_hrs": avg_response_hrs
        },
        "no_show_threshold_students": no_show_list
    }

@router.get("/export-appointments")
def export_appointments(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    appointments = db.query(Appointment).all()

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow(["ID", "Student", "Email", "Faculty", "Date", "Start Time", "End Time", "Purpose", "Status", "Response Time (Hrs)"])
    
    for appt in appointments:
        resp_time = ""
        if appt.responded_at and appt.created_at:
            diff = appt.responded_at - appt.created_at
            resp_time = round(diff.total_seconds() / 3600, 2)
            
        writer.writerow([
            appt.id,
            appt.booker.name if appt.booker else "N/A",
            appt.booker.email if appt.booker else "N/A",
            appt.faculty.user.name if appt.faculty and appt.faculty.user else "N/A",
            appt.date.isoformat() if appt.date else "N/A",
            appt.start_time.strftime("%H:%M") if appt.start_time else "N/A",
            appt.end_time.strftime("%H:%M") if appt.end_time else "N/A",
            appt.purpose or "",
            appt.status,
            resp_time
        ])

    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=appointments_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"}
    )

# ==========================================
# 6. TIMETABLE AUTOMATION
# ==========================================

setup_status = {"status": "idle", "message": "", "errors": []}

def run_setup_task(file_path):
    db = SessionLocal()
    try:
        result = run_semester_setup(db, file_path)
        if result["success"]:
            setup_status["status"] = "completed"
            setup_status["message"] = f"Success! Generated {result['slots_generated']} blocked slots."
            if result["errors_to_review"]:
                setup_status["message"] += f" ({len(result['errors_to_review'])} items could not be matched)."
                setup_status["errors"] = result["errors_to_review"]
        else:
            setup_status["status"] = "failed"
            setup_status["message"] = result["error"]
    except Exception as e:
        setup_status["status"] = "failed"
        setup_status["message"] = str(e)
    finally:
        db.close()
        if os.path.exists(file_path):
            os.remove(file_path)

@router.post("/upload-timetable")
async def upload_timetable(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...), 
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    allowed_extensions = {".pdf", ".csv"}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Only PDF and CSV files are allowed")
        
    setup_status["status"] = "processing"
    setup_status["message"] = "Extracting timetable... This takes about 15-30 seconds."
    setup_status["errors"] = []
    
    # Save the uploaded PDF temporarily
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb+") as file_object:
        file_object.write(file.file.read())
        
    background_tasks.add_task(run_setup_task, temp_file_path)
    
    return {"message": "Processing started", "status_path": "/api/admin/setup-status"}

@router.get("/setup-status")
async def get_setup_status(current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return setup_status