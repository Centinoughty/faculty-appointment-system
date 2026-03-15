from pydantic import BaseModel
from typing import Optional

class UserProfile(BaseModel):
    email: str
    role: str
    profile_picture: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    # For Student
    roll_number: Optional[str] = None
    # For Professor
    designation: Optional[str] = None
    office: Optional[str] = None
    department_name: Optional[str] = None

    class Config:
        from_attributes = True
