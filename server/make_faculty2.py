import sys
from sqlalchemy.orm import sessionmaker
from database import engine
from models.models import User, Faculty, Student, Department

Session = sessionmaker(bind=engine)
session = Session()

def make_faculty():
    email = "isha_b230347ch@nitc.ac.in"
    user = session.query(User).filter(User.email == email).first()
    
    if not user:
        user = session.query(User).first()
        if not user:
            print("No users found.")
            return

    print(f"Making {user.email} a faculty...")
    
    department = session.query(Department).first()
    if not department:
        department = Department(name="Computer Science")
        session.add(department)
        session.commit()
    
    user.role = "faculty"
    
    student = session.query(Student).filter(Student.user_id == user.id).first()
    if student:
        session.delete(student)
        
    faculty = session.query(Faculty).filter(Faculty.user_id == user.id).first()
    if not faculty:
        faculty = Faculty(user_id=user.id, designation="Professor", department_id=department.id)
        session.add(faculty)
    else:
        faculty.department_id = department.id
        
    try:
        session.commit()
        print("Success")
    except Exception as e:
        print("Error:", e)
        session.rollback()

if __name__ == "__main__":
    make_faculty()
