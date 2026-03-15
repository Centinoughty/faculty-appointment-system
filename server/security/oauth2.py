from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, FastAPI, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from pydantic import BaseModel

from models.models import User
from schemas.token import TokenData
from . import JWTtoken

from sqlalchemy.orm import Session
from database import get_db
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def get_current_user(request: Request,
                     db: Session = Depends(get_db)
                     ):
    token = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        print("DEBUG: Token found in Authorization header")
    else:
        token = request.cookies.get("access_token")
        if token:
            print("DEBUG: Token found in access_token cookie")
        else:
            print("DEBUG: No token found in headers or cookies")
            print(f"DEBUG: Cookies received: {request.cookies.keys()}")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    email: str = None
    try:
        payload = jwt.decode(token, JWTtoken.SECRET_KEY, algorithms=[JWTtoken.ALGORITHM])
        print(f"DEBUG: JWT Payload: {payload}")
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except InvalidTokenError as err:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user:
        # Attach picture from JWT to user object (ephemeral)
        user.profile_picture = payload.get("picture")

    return user