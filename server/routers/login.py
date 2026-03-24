from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from models.models import User, Student, Faculty, Department
from schemas.user import UserLogin
from security.JWTtoken import create_access_token, create_refresh_token
from database import get_db

from passlib.context import CryptContext
from security.oauth2 import get_current_user, set_auth_cookies, clear_auth_cookies

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
from dotenv import load_dotenv

router = APIRouter(
    prefix="/api",
    tags=["Login"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
load_dotenv()

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')



def build_user_response(user: User, db: Session) -> dict:
    base = {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "picture": user.picture,
    }

    if user.role == "student":
        student = db.query(Student).filter(Student.user_id == user.id).first()
        if student:
            dept = db.query(Department).filter(Department.id == student.department_id).first()
            base["phone"] = student.phone
            base["student"] = {
                "rollNumber": student.roll_number,
                "department": {"id": dept.id, "name": dept.name} if dept else None,
            }

    elif user.role == "faculty":
        faculty = db.query(Faculty).filter(Faculty.user_id == user.id).first()
        if faculty:
            dept = db.query(Department).filter(Department.id == faculty.department_id).first()
            base["phone"] = faculty.phone
            base["faculty"] = {
                "department": {"id": dept.id, "name": dept.name} if dept else None,
            }

    return base


@router.post("/auth/google")
async def google_login(request: Request, response: Response, db: Session = Depends(get_db)):
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or empty JSON body")

    token = data.get("idToken")
    if not token:
        raise HTTPException(status_code=400, detail="No token provided")

    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo["email"]
    except Exception as e:
        print("Google token verification failed:", e)
        raise HTTPException(status_code=401, detail="Invalid Google token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    picture = idinfo.get("picture")
    if user.picture is None or  picture and user.picture != picture:
        user.picture = picture
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})

    set_auth_cookies(response, access_token, refresh_token, user.role)

    return build_user_response(user, db)
@router.post("/auth/login")
def login(request: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        print(f"DEBUG: No user found for email: {request.email}")
        raise HTTPException(status_code=401, detail="User not found")

    print(f"DEBUG: User found: {user.email}, stored hash: {user.password[:20]}...")
    
    verified = pwd_context.verify(request.password, user.password)
    print(f"DEBUG: Password verified: {verified}")
    
    if not verified:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})
    set_auth_cookies(response, access_token, refresh_token, user.role)
    return build_user_response(user, db)


    ...
@router.post("/logout")
def logout(response: Response):
    clear_auth_cookies(response)
    return {"message": "Logged out"}

@router.get("/auth/me")
def get_current_user_profile(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    return build_user_response(current_user, db)

import jwt
from jwt.exceptions import InvalidTokenError
from security.JWTtoken import create_access_token, create_refresh_token, SECRET_KEY, ALGORITHM

@router.post("/auth/refresh")
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    new_access_token = create_access_token(data={"sub": user.email})
    new_refresh_token = create_refresh_token(data={"sub": user.email})

    set_auth_cookies(response, new_access_token, new_refresh_token, user.role)

    return {"message": "Token refreshed"}