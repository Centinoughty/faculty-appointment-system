from pydantic import BaseModel
from typing import List, Optional


class FacultyOut(BaseModel):
    """Used by the student-side faculty listing."""
    user_id: int
    name: str
    designation: Optional[str] = None
    office: Optional[str] = None
    department_name: Optional[str] = None

    class Config:
        from_attributes = True


class FacultyProfileOut(BaseModel):
    """Full profile returned to the logged-in professor."""
    user_id: int
    name: str
    email: str
    designation: Optional[str] = None
    office: Optional[str] = None
    employee_id: Optional[str] = None
    department_name: Optional[str] = None
    keywords: List[str] = []

    class Config:
        from_attributes = True


class FacultyProfileUpdate(BaseModel):
    """Request body for PUT /api/faculty/profile."""
    name: str
    designation: Optional[str] = None
    office: Optional[str] = None
    employee_id: Optional[str] = None
    keywords: Optional[List[str]] = []
