from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
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
        email = idinfo["email"]
        if not email.endswith("@nitc.ac.in"):
            raise HTTPException(
                status_code=403,
                detail="Only NITC email accounts are allowed"
            )
        
    except Exception as e:
        print("Google token verification failed:", e)
        raise HTTPException(status_code=401, detail="Invalid Google token")
    
    user = db.query(User).filter(User.email == email).first()
        
    access_token = create_access_token(data={"sub": user.email})
    refresh_token = create_refresh_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "role": user.role,
        "email": user.email
    }
