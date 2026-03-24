from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from datetime import date, time, timedelta, datetime

from sqlalchemy.orm import Session
from sqlalchemy import case

from database import get_db
from models.models import User, Student, Faculty, Department, Slot, Appointment

from security.oauth2 import get_current_user
from schemas.user import UserProfileUpdate



import random
import string
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/api", tags=["Users"])


@router.patch("/profile")
def update_user_profile(
    body: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    
    if body.currentPassword and body.newPassword is not None:
        verified = pwd_context.verify(body.currentPassword, user.password)
        if not verified:
            raise HTTPException(status_code=400, detail="Invalid current password") 
        user.password = pwd_context.hash(body.newPassword) 

    # role-specific updates
    if user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if student:
            if body.phone is not None:
                student.phone = body.phone
    elif user.role == "faculty":
        faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        if faculty:
            if body.designation is not None:
                faculty.designation = body.designation
            if body.office is not None:
                faculty.office = body.office
            if body.phone is not None:
                faculty.phone = body.phone

    db.commit()
    db.refresh(user)

    response = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }

    if user.role == "student":
        student = db.query(Student).filter(Student.user_id == user.id).first()
        if student:
            response.update({
                "phone": student.phone,
                "roll_number": student.roll_number,
                "programme": student.programme,
                "year": student.year,
            })

    elif user.role == "faculty":
        faculty = db.query(Faculty).filter(Faculty.user_id == user.id).first()
        if faculty:
            dept = db.query(Department).filter(Department.id == faculty.department_id).first()
            response.update({
                "phone": faculty.phone,
                "designation": faculty.designation,
                "office": faculty.office,
                "department": {"id": dept.id, "name": dept.name} if dept else None,
            })

    return response