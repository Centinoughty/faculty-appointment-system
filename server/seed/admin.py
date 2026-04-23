import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine, Base 
from models.models import User, Admin 
from passlib.context import CryptContext

Base.metadata.create_all(bind=engine)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_admin():
    db = SessionLocal()
    email = "admin@nitc.ac.in"
    
    try:
        # 1. Check if the user already exists
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            print(f"⏳ Admin {email} already exists. Resetting password and flags...")
            user.password = pwd_context.hash("admin123")
            user.first_login = False  # Allows password login
            user.role = "admin"
        else:
            print(f"⏳ Creating Admin user {email}...")
            user = User(
                email=email,
                name="Super Admin",
                password=pwd_context.hash("admin123"),
                role="admin",
                first_login=False # Allows password login
            )
            db.add(user)
            db.flush()

        # 2. Ensure Admin Profile exists
        profile = db.query(Admin).filter(Admin.user_id == user.id).first()
        if not profile:
            print("⏳ Creating Admin profile link...")
            new_admin_profile = Admin(user_id=user.id)
            db.add(new_admin_profile)

        db.commit()
        print("🎉 Success! Admin info:")
        print(f"👉 Email: {email}")
        print("👉 Password: admin123")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()