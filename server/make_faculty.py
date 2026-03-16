import sys
from database import SessionLocal
from models.models import User, Student, Professor, Department

def make_faculty(email: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Error: User with email '{email}' not found.")
            print("Please login to the app first so the account gets created as a student, then run this script.")
            return

        if user.role == "professor":
            print(f"User '{email}' is already a professor.")
            return

        # 1. Delete Student profile if it exists
        student = db.query(Student).filter(Student.user_id == user.id).first()
        if student:
            # First delete any existing appointments for this student due to foreign key constraints
            from models.models import Appointment
            appointments = db.query(Appointment).filter(Appointment.student_id == user.id).all()
            if appointments:
                print(f"Removing {len(appointments)} associated appointment(s) for {email}...")
                db.query(Appointment).filter(Appointment.student_id == user.id).delete()
                
            print(f"Removing student profile for {email}...")
            db.delete(student)
            
        # 2. Update role to 'professor'
        user.role = "professor"
        
        # 3. Ensure a Department exists to link to the Professor
        dept = db.query(Department).first()
        if not dept:
            print("No departments found. Creating a default 'Computer Science' department...")
            dept = Department(name="Computer Science & Engineering")
            db.add(dept)
            db.commit()
            db.refresh(dept)
            
        # 4. Create Professor profile
        print(f"Creating professor profile for {email}...")
        prof = Professor(
            user_id=user.id,
            name=email.split("@")[0].replace(".", " ").title(),
            designation="Assistant Professor",
            department_id=dept.id
        )
        db.add(prof)
        db.commit()
        
        print(f"\nSUCCESS! '{email}' has been successfully upgraded to a Professor.")
        print("Important: Please logout from the frontend and login again to refresh your session features.")

    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_faculty.py <your_email>")
        sys.exit(1)
    
    make_faculty(sys.argv[1])
