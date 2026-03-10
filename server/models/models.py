
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

    name=Column(String(255))
    department_id = Column(Integer, ForeignKey("departments.id"))

    # Relationship
    department = relationship("Department", back_populates="professors")


class Admin(Base):
    __tablename__ = "admins"
    
    ##permissions = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    user = relationship("User", back_populates="admin")