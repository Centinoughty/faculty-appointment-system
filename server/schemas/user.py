from pydantic import BaseModel
from typing import Optional

class UserLogin(BaseModel):
    email: str
    password: str


class UserProfileUpdate(BaseModel):
    currentPassword: str | None = None
    newPassword: str | None = None
    phone: str | None = None

    designation: str | None = None
    office: str | None = None