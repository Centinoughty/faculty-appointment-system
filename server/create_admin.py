import sys
import os
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import secrets
import string

# Add current directory to path so we can import project modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.models import User, Admin
from database import SessionLocal

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin(email, name):
    db = SessionLocal()
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"User {email} already exists.")
            return

        # Generate a random password
        alphabet = string.ascii_letters + string.digits
        password = ''.join(secrets.choice(alphabet) for i in range(12))
        hashed_password = pwd_context.hash(password)

        new_user = User(
            email=email,
            name=name,
            password=hashed_password,
            role="admin",
            first_login=False
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        new_admin = Admin(user_id=new_user.id)
        db.add(new_admin)
        db.commit()

        print("\n" + "="*40)
        print("ADMIN ACCOUNT CREATED SUCCESSFULLY")
        print("="*40)
        print(f"Email:    {email}")
        print(f"Password: {password}")
        print("="*40)
        print("IMPORTANT: Save this password now. It is hashed in the database.")
        print("="*40 + "\n")
        
    except Exception as e:
        print(f"Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Using your provided details
    email = "sanin@gmail.com"
    name = "sanin123"
    create_admin(email, name)
