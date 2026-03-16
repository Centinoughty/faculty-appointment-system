from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd

from database import get_db
from models.models import User, Professor, Department

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
    df = pd.read_excel(file.file)

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