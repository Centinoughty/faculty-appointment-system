from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from models.models import User, Student, Faculty, Department
from schemas.user import UserLogin
from security.JWTtoken import create_access_token, create_refresh_token, verify_access_token
from database import get_db

from passlib.context import CryptContext
from security.oauth2 import get_current_user, set_auth_cookies, clear_auth_cookies

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
import urllib.parse
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from datetime import timedelta
from services.email_service import send_appointment_email

load_dotenv()

router = APIRouter(
    prefix="/api",
    tags=["Login"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')



def build_user_response(user: User, db: Session) -> dict:
    """Build the common user info response based on role."""
    base = {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "picture": user.picture,
        "first_login": user.first_login
    }

    if user.role == "student":
        student = db.query(Student).filter(Student.user_id == user.id).first()
        if student:
            base["roll_number"] = student.roll_number
            base["programme"] = student.programme
            base["year"] = student.year

    elif user.role == "faculty":
        faculty = db.query(Faculty).filter(Faculty.user_id == user.id).first()
        if faculty:
            dept = db.query(Department).filter(Department.id == faculty.department_id).first()
            base["designation"] = faculty.designation
            base["office"] = faculty.office
            base["department"] = dept.name if dept else None
            base["busy"] = faculty.busy

    return base


@router.get("/auth/google")
def google_auth_redirect():
    google_client_id = os.getenv('GOOGLE_CLIENT_ID')
    if not google_client_id:
        raise HTTPException(status_code=500, detail="Google Client ID not found in environment")
        
    nonce = os.urandom(16).hex()
    params = {
        "client_id": google_client_id,
        "redirect_uri": os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:3000/login'),
        "response_type": "token id_token",
        "scope": "openid email profile",
        "nonce": nonce
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url)


@router.post("/auth/google/login")
async def google_login(request: Request, response: Response, db: Session = Depends(get_db)):
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or empty JSON body")

    token = data.get("idToken")
    if not token:
        raise HTTPException(status_code=400, detail="No token provided")

    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID, clock_skew_in_seconds=10)
        email = idinfo["email"]
    except Exception as e:
        print("Google token verification failed:", e)
        raise HTTPException(status_code=401, detail="Invalid Google token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=403, detail="Your account has not been approved/added by the admin yet.")
    
    if user.is_blacklisted:
        raise HTTPException(status_code=403, detail="You are blacklisted")

    picture = idinfo.get("picture")
    if picture and user.picture != picture:
        user.picture = picture
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})

    set_auth_cookies(response, access_token, refresh_token, user.role)

    return build_user_response(user, db)


@router.post("/login")
def login(request: UserLogin, response: Response, db: Session = Depends(get_db)):
    print(f"DEBUG: Login attempt for email: '{request.email}'")
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        print(f"DEBUG: User not found: '{request.email}'")
        raise HTTPException(status_code=401, detail="User not found")
        
    if user.is_blacklisted:
        raise HTTPException(status_code=403, detail="You are blacklisted")

    if user.first_login and user.role != "admin":
        raise HTTPException(status_code=403, detail="Please use Google Sign-In for your first login.")

    if not pwd_context.verify(request.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})

    set_auth_cookies(response, access_token, refresh_token, user.role)

    return build_user_response(user, db)

@router.post("/logout")
def logout(response: Response):
    clear_auth_cookies(response)
    return {"message": "Logged out"}

@router.get("/auth/me")
def get_current_user_profile(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if current_user.is_blacklisted:
        raise HTTPException(status_code=403, detail="You are blacklisted")
    return build_user_response(current_user, db)

from pydantic import BaseModel

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/auth/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email.lower()).first()
    if not user:
        return {"message": "If that email is in our system, we've sent a password reset link."}
        
    reset_token = create_access_token(data={"sub": user.email, "type": "reset"}, expires_delta=timedelta(minutes=15))
    
    # Use the FRONTEND_URL from environment to build the reset link
    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}" 
    
    email_html = f"""
    <h2>Reset Your FAMS Password</h2>
    <p>We received a request to reset your password. Click the link below to set a new password:</p>
    <a href="{reset_link}">Reset Password</a>
    <p>This link will expire in 15 minutes.</p>
    """
    send_appointment_email(request.email, "FAMS Password Reset", email_html)
    return {"message": "If that email is in our system, we've sent a password reset link."}

@router.post("/auth/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        payload = verify_access_token(request.token)
        email = payload.get("sub")
        token_type = payload.get("type")
        if token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid token type.")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    user.password = pwd_context.hash(request.new_password)
    user.first_login = False
    db.commit()
    
    return {"message": "Password reset successfully. You can now log in."}
    
class PasswordSetup(BaseModel):
    new_password: str

@router.post("/auth/set-password")
def set_password(payload: PasswordSetup, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.first_login:
        raise HTTPException(status_code=400, detail="Password has already been set.")
    
    current_user.password = pwd_context.hash(payload.new_password)
    current_user.first_login = False
    db.commit()
    return {"message": "Password updated successfully"}