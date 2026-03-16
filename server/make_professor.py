import sys
from database import SessionLocal
from models.models import User, Professor, Department, Student

if len(sys.argv) < 2:
    print("Please provide an email address. Example: python make_professor.py your.email@gmail.com")
    sys.exit(1)

email = sys.argv[1]
db = SessionLocal()

user = db.query(User).filter(User.email == email).first()
if not user:
    print(f"User with email {email} not found! Please login via Google first so the account gets created.")
    sys.exit(1)

# Update the user role
user.role = "professor"

# Remove the student profile if it exists (since google login creates a student profile by default)
student = db.query(Student).filter(Student.user_id == user.id).first()
if student:
    db.delete(student)

db.commit()

# Ensure we have at least one department to assign to
dept = db.query(Department).first()
if not dept:
    dept = Department(name="Computer Science")
    db.add(dept)
    db.commit()
    db.refresh(dept)

# Create the professor profile if it doesn't exist
prof = db.query(Professor).filter(Professor.user_id == user.id).first()
if not prof:
    prof = Professor(
        user_id=user.id,
        name=email.split("@")[0].capitalize(),
        designation="Assistant Professor",
        office="Faculty Room 101",
        employee_id="FAC-" + str(user.id),
        keywords="AI, Machine Learning",
        department_id=dept.id
    )
    db.add(prof)
    db.commit()

print(f"Successfully updated user {email} to act as a professor!")
