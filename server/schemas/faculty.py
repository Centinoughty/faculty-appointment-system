from pydantic import BaseModel, field_validator
from typing import List, Optional

class FacultyOut(BaseModel):
    user_id: int
    name: str
    designation: Optional[str] = None
    office: Optional[str] = None
    department_name: Optional[str] = None

    class Config:
        from_attributes = True
