import sys
import os

# Add the server directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.models import User, Student, Faculty, Admin, Department

def switch_role(email: str, new_role: str):
    if new_role not in ["student", "faculty", "admin"]:
        print("❌ Invalid role. Must be 'student', 'faculty', or 'admin'.")
        return

    db = SessionLocal()
    
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"❌ User with email {email} not found in the database.")
            print("Make sure you have logged in at least once so the auto-registration creates your account.")
            return
            
        old_role = user.role
        if old_role == new_role:
            print(f"✅ User is already a {new_role}.")
            return
            
        print(f"Converting user from '{old_role}' to '{new_role}'...")
        user.role = new_role
        
        # 1. Delete old profile
        if old_role == "student":
            db.query(Student).filter(Student.user_id == user.id).delete()
        elif old_role == "faculty":
            db.query(Faculty).filter(Faculty.user_id == user.id).delete()
        elif old_role == "admin":
            db.query(Admin).filter(Admin.user_id == user.id).delete()
            
        # 2. Create new profile
        if new_role == "faculty":
            # Faculty needs a department in this schema
            dept = db.query(Department).first()
            if not dept:
                print("⚠️ No Departments found. Creating a default 'Computer Science' department.")
                dept = Department(name="Computer Science")
                db.add(dept)
                db.commit()
                db.refresh(dept)
                
            new_profile = Faculty(
                user_id=user.id, 
                designation="Test Professor", 
                office="Dev Room", 
                department_id=dept.id
            )
            db.add(new_profile)
            
        elif new_role == "admin":
            new_profile = Admin(user_id=user.id)
            db.add(new_profile)
            
        elif new_role == "student":
            new_profile = Student(user_id=user.id)
            db.add(new_profile)
            
        db.commit()
        print(f"🎉 Successfully promoted {email} to {new_role}!")
        
    except Exception as e:
        print(f"❌ Error during role switch: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python switch_role.py <your_google_email> <new_role>")
        print("Example: python switch_role.py myemail@gmail.com faculty")
        sys.exit(1)
        
    email_arg = sys.argv[1]
    role_arg = sys.argv[2].lower()
    switch_role(email_arg, role_arg)
