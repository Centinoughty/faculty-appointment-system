
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean,Text,DateTime, Table
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy.sql.sqltypes import Float, Date

from sqlalchemy.orm import foreign
from sqlalchemy import and_


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    role = Column(String(255), index=True)

    # Relationships
    student = relationship("Student", back_populates="user", uselist=False)
    professor = relationship("Professor", back_populates="user", uselist=False)
    admin = relationship("Admin", back_populates="user", uselist=False)

class Student(Base):
    __tablename__ = "students"

    
    name = Column(String(255))
    phone = Column(String(255))
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    user = relationship("User", back_populates="student")



class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))

    professors = relationship("Professor", back_populates="department")

class Professor(Base):
    __tablename__ = "professors"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    user = relationship("User", back_populates="professor")

    name = Column(String(255))
    designation = Column(String(255))          # e.g. "Associate Professor"
    office = Column(String(255))               # e.g. "IT Lab 102"
    employee_id = Column(String(100))          # e.g. "EMP90210"
    keywords = Column(Text, default="")        # comma-separated research keywords
    department_id = Column(Integer, ForeignKey("departments.id"))

    # Relationships
    department = relationship("Department", back_populates="professors")
    availability_slots = relationship("AvailabilitySlot", back_populates="professor", cascade="all, delete-orphan")
    timetable_entries = relationship("TimetableEntry", back_populates="professor", cascade="all, delete-orphan")
    timetable_exemptions = relationship("TimetableExemption", back_populates="professor", cascade="all, delete-orphan")


class Admin(Base):
    __tablename__ = "admins"
    
    ##permissions = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    user = relationship("User", back_populates="admin")

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.user_id"))
    professor_id = Column(Integer, ForeignKey("professors.user_id"))
    purpose = Column(String(255))
    description = Column(Text)
    date = Column(Date)
    time = Column(String(50))          # e.g., "10:30 AM"
    status = Column(String(50), default="pending")  # pending, confirmed, declined, cancelled, completed
    location = Column(String(255))     # Usually the professor's office
    rejection_reason = Column(Text)    # Optional reason when status = declined or cancelled


class AvailabilitySlot(Base):
    """Faculty-managed open/busy slots visible on the calendar."""
    __tablename__ = "availability_slots"
    id = Column(Integer, primary_key=True, index=True)
    professor_id = Column(Integer, ForeignKey("professors.user_id"))
    date = Column(Date, nullable=False)
    hour = Column(Integer, nullable=False)     # 0-23
    title = Column(String(255))
    slot_type = Column(String(50), default="available")  # available | busy

    professor = relationship("Professor", back_populates="availability_slots")


class TimetableEntry(Base):
    """Recurring weekly class slot for a professor."""
    __tablename__ = "timetable_entries"
    id = Column(Integer, primary_key=True, index=True)
    professor_id = Column(Integer, ForeignKey("professors.user_id"))
    day_of_week = Column(String(20), nullable=False)  # Monday … Sunday
    hour = Column(Integer, nullable=False)             # 0-23
    subject = Column(String(255), nullable=False)

    professor = relationship("Professor", back_populates="timetable_entries")


class TimetableExemption(Base):
    """Cancels a recurring TimetableEntry for a specific calendar date."""
    __tablename__ = "timetable_exemptions"
    id = Column(Integer, primary_key=True, index=True)
    professor_id = Column(Integer, ForeignKey("professors.user_id"))
    date = Column(Date, nullable=False)     # The specific date to cancel on
    hour = Column(Integer, nullable=False)  # The hour that is cancelled

    professor = relationship("Professor", back_populates="timetable_exemptions")
