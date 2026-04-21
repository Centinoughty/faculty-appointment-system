from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Text, Date, Time, Table
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy.sql.sqltypes import Float, Date
from sqlalchemy.orm import foreign
from sqlalchemy import and_, Enum, DateTime
from sqlalchemy.sql import func


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name= Column(String(255))
    picture = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, index=True)
    password = Column(String(255), nullable=True)
    role = Column(String(255), index=True)
    first_login = Column(Boolean, default=True)

    # Relationships
    student = relationship("Student", back_populates="user", uselist=False)
    faculty = relationship("Faculty", back_populates="user", uselist=False)
    admin = relationship("Admin", back_populates="user", uselist=False)
    appointments = relationship("Appointment", back_populates="booker", foreign_keys="Appointment.booker_id")


class Student(Base):
    __tablename__ = "students"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)

    phone = Column(String(255))
    roll_number = Column(String(50), unique=True, index=True)
    programme = Column(Enum("btech", "mtech", "phd", name="programme"), nullable=True)
    year = Column(Integer, nullable=True)
    no_show_count = Column(Integer, default=0)
    is_blacklisted = Column(Boolean, default=False)

    user = relationship("User", back_populates="student")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    hod_id = Column(Integer, ForeignKey("faculty.user_id"), nullable=True)

    faculty = relationship("Faculty", back_populates="department", foreign_keys="Faculty.department_id")
    hod = relationship("Faculty", foreign_keys=[hod_id])


class Faculty(Base):
    __tablename__ = "faculty"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    user = relationship("User", back_populates="faculty")

    designation = Column(String(255))
    office = Column(String(255))
    short_code = Column(String(50), nullable=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    busy = Column(Boolean, default=False)

    department = relationship("Department", back_populates="faculty", foreign_keys=[department_id])
    slots = relationship("Slot", back_populates="faculty")
    appointments = relationship("Appointment", back_populates="faculty", foreign_keys="Appointment.faculty_id")


class Admin(Base):
    __tablename__ = "admins"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    user = relationship("User", back_populates="admin")


class Slot(Base):
    __tablename__ = "slots"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.user_id"))
    day = Column(Integer)
    start_time = Column(Time)
    end_time = Column(Time)

    faculty = relationship("Faculty", back_populates="slots")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.user_id"))
    date = Column(Date)
    start_time = Column(Time)
    end_time = Column(Time)
    created_at = Column(DateTime, server_default=func.now())
    responded_at = Column(DateTime, nullable=True)

    booker_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    purpose = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(Enum("pending", "approved", "rejected", "cancelled","blocked", "completed", "no-show", name="status"), default="pending")
    rejection_reason = Column(String(500), nullable=True)

    booker = relationship("User", back_populates="appointments", foreign_keys=[booker_id])
    faculty = relationship("Faculty", back_populates="appointments", foreign_keys=[faculty_id])

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String(50))
    title = Column(String(255))
    message = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    read = Column(Boolean, default=False)
    action_url = Column(String(255), nullable=True)

    user = relationship("User")


class FcmToken(Base):
    __tablename__ = "fcm_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    token = Column(String(255), unique=True, index=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User")