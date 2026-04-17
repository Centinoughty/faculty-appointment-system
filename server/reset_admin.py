import sys
import os
from passlib.context import CryptContext

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.models import User
from database import SessionLocal

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def reset_admin(email, new_password):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Error: User {email} not found.")
            return

        hashed_password = pwd_context.hash(new_password)
        user.password = hashed_password
        db.commit()

        print("\n" + "="*40)
        print("PASSWORD RESET SUCCESSFULLY")
        print("="*40)
        print(f"Email:    {email}")
        print(f"Password: {new_password}")
        print("="*40 + "\n")
        
    except Exception as e:
        print(f"Error resetting password: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python reset_admin.py <new_password>")
        sys.exit(1)
        
    email = "arunkrishna716@gmail.com"
    new_pwd = sys.argv[1]
    reset_admin(email, new_pwd)
