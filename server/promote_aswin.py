import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.models import User, Student, Faculty, Admin, Department

def promote_aswin():
    db = SessionLocal()
    
    try:
        user = db.query(User).filter(User.email == 'aswin_b230213cs@nitc.ac.in').first()
        if not user:
            print("User aswin_b230213cs@nitc.ac.in not found")
            return
            
        print(f"Found user {user.name} ({user.email}) with role {user.role}")
        
        old_role = user.role
        if old_role in ["faculty", "professor"]:
            print(f"User is already a faculty/professor.")
            return

        user.role = "professor"
        
        if old_role == "student":
            db.query(Student).filter(Student.user_id == user.id).delete()
            
        dept = db.query(Department).first()
        if not dept:
            dept = Department(name="Computer Science")
            db.add(dept)
            db.commit()
            db.refresh(dept)
            
        new_profile = Faculty(
            user_id=user.id, 
            designation="Professor", 
            office="101A", 
            department_id=dept.id,
            busy=False
        )
        db.add(new_profile)
        db.commit()
        print(f"Successfully promoted {user.email} to professor!")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    promote_aswin()
