from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from models.models import User
from security.JWTtoken import create_access_token, create_refresh_token, verify_access_token
from database import get_db

from passlib.context import CryptContext

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from security.oauth2 import get_current_user

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
from dotenv import load_dotenv

from datetime import timedelta


from urllib.parse import urlencode

import random
import string


router =APIRouter(
    prefix="/api",
    tags=["Login"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

get_db=get_db

load_dotenv()


GOOGLE_CLIENT_ID=os.getenv('GOOGLE_CLIENT_ID')

@router.get("/auth/google")
async def google_auth_redirect():
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID not configured")
    
    # Initiation of Google Login (Implicit Flow for ID Token)
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": "http://localhost:3000/login", # The frontend page that handles the token
        "response_type": "id_token",
        "scope": "openid email profile",
        "nonce": "".join(random.choices(string.ascii_letters + string.digits, k=16)),
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url)

@router.post("/auth/google/login")
async def google_login(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
    except Exception:
        return {"error": "Invalid or empty JSON body"}
    token = data.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="No token provided")

    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        print(f"DEBUG: idinfo keys: {idinfo.keys()}")
        email = idinfo["email"]
        # TODO: Uncomment for production to restrict to NITC accounts
        # if not email.endswith("@nitc.ac.in"):
        #     raise HTTPException(
        #         status_code=403,
        #         detail="Only NITC email accounts are allowed"
        #     )
        
    except HTTPException as h:
        raise h
    except Exception as e:
        print("Google token verification failed:", e)
        raise HTTPException(status_code=401, detail="Invalid Google token")
    
    user = db.query(User).filter(User.email == email).first()
    picture_url = idinfo.get("picture")
    
    if not user:
        print(f"Auto-registering user: {email}")
        # 1. Create User
        user = User(email=email, role="student")
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # 2. Create Student Profile
        student_name = idinfo.get("name", email.split('@')[0])
        student = Student(
            user_id=user.id,
            name=student_name,
            phone="" # Optional, can be updated later
        )
        db.add(student)
        db.commit()
        print(f"Student profile created for {email}")
        
    access_token = create_access_token(data={"sub": user.email, "picture": picture_url})
    refresh_token = create_refresh_token(data={"sub": user.email})

    response = Response(content="Login successful")
    # Set cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=3600 * 24 * 7, # 7 days
        samesite="lax",
        secure=False, # Set to True in production with HTTPS
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=3600 * 24 * 7,
        samesite="lax",
        secure=False,
    )

    return response
from schemas.user import UserProfile
from models.models import Student, Professor, Department

@router.get("/auth/me", response_model=UserProfile)
async def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Initialize basic info
    profile_data = {
        "email": current_user.email,
        "role": current_user.role,
        "profile_picture": getattr(current_user, "profile_picture", None)
    }
    print(f"DEBUG: profile_data being sent: {profile_data}")
    
    # Add Student details if role is student
    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if student:
            profile_data.update({
                "name": student.name,
                "phone": student.phone,
            })
            
            # Helper to parse email: firstname_b230203cs@nitc.ac.in
            try:
                local_part = current_user.email.split('@')[0]
                if '_' in local_part:
                    roll_number = local_part.split('_')[1]
                    dept_code = roll_number[-2:].upper()
                    profile_data["roll_number"] = roll_number.upper()
                    profile_data["department_name"] = dept_code # e.g. "CS"
            except Exception:
                pass
            
    # Add Professor details if role is professor
    elif current_user.role == "professor":
        professor = db.query(Professor).filter(Professor.user_id == current_user.id).first()
        if professor:
            profile_data.update({
                "name": professor.name,
            })
            # Get department name
            dept = db.query(Department).filter(Department.id == professor.department_id).first()
            if dept:
                profile_data["department_name"] = dept.name
                
    return profile_data

@router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successful"}
