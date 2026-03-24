from jwt.exceptions import InvalidTokenError
import jwt
import logging
import os

from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from models.models import User
from schemas.token import TokenData
from . import JWTtoken
from database import get_db

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Read once from env so the same module works in dev and prod.
# In dev:  COOKIE_SECURE=false, COOKIE_SAMESITE=lax  (same-origin or proxied)
# In prod: COOKIE_SECURE=true,  COOKIE_SAMESITE=none (cross-origin with HTTPS)
# ---------------------------------------------------------------------------
_COOKIE_SECURE   = os.getenv("COOKIE_SECURE", "false").lower() == "true"

# Starlette requires exactly "strict", "lax", or "none" (lowercase).
# Default to "lax" for dev (same-origin / proxied).
# Set COOKIE_SAMESITE=none in prod (requires COOKIE_SECURE=true + HTTPS).
_RAW_SAMESITE    = os.getenv("COOKIE_SAMESITE", "lax").strip().lower()
assert _RAW_SAMESITE in ("strict", "lax", "none"), \
    f"COOKIE_SAMESITE must be 'strict', 'lax', or 'none', got: {_RAW_SAMESITE!r}"
_COOKIE_SAMESITE = _RAW_SAMESITE


def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = None

    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    else:
        token = request.cookies.get("access_token")

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

    try:
        payload = jwt.decode(token, JWTtoken.SECRET_KEY, algorithms=[JWTtoken.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except InvalidTokenError:
        raise credentials_exception

    user = db.query(User).filter(User.email == token_data.email).first()
    if not user:
        raise credentials_exception

    user.profile_picture = payload.get("picture")
    return user


def set_auth_cookies(response, access_token: str, refresh_token: str, role: str = None):
    # ---------- access token (short-lived) ----------
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=_COOKIE_SECURE,
        samesite=_COOKIE_SAMESITE,
        max_age=1800,                   # 30 min
    )

    # ---------- refresh token (long-lived, path-restricted) ----------
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=_COOKIE_SECURE,
        samesite=_COOKIE_SAMESITE,
        max_age=60 * 60 * 24 * 7,       # 7 days
        path="/api/auth/refresh",        # only sent to the refresh endpoint
    )

    # ---------- role (readable by JS for UI routing) ----------
    if role:
        response.set_cookie(
            key="role",
            value=role,
            httponly=False,              # intentionally JS-readable
            secure=_COOKIE_SECURE,
            samesite=_COOKIE_SAMESITE,
            max_age=60 * 60 * 24 * 7,
        )


def clear_auth_cookies(response):
    # Must mirror the same path/samesite/secure that was used when setting,
    # otherwise some browsers won't actually delete the cookie.
    _kw = {"secure": _COOKIE_SECURE, "samesite": _COOKIE_SAMESITE}
    response.delete_cookie("access_token", **_kw)
    response.delete_cookie("refresh_token", path="/api/auth/refresh", **_kw)
    response.delete_cookie("role", **_kw)