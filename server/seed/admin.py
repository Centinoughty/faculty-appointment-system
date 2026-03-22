import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 1. ADDED 'Admin' to the import list!
from database import SessionLocal, engine, Base 
from models.models import User, Admin 
from passlib.context import CryptContext

Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_admin():
    db = SessionLocal()
    
    try:
        existing_admin = db.query(User).filter(User.email == "admin@nitc.ac.in").first()
        
        if existing_admin:
            print("✅ Admin user already exists in the database.")
            return
        
        print("⏳ Creating Admin user...")
        hashed_password = pwd_context.hash("admin123") 
        
        # Step A: Create the Base User
        new_user = User(
            email="admin@nitc.ac.in",
            name="Super Admin",
            password=hashed_password,
            role="admin"
        )
        db.add(new_user)
        db.flush() # This saves the user temporarily so we can grab its new ID!
        
        # Step B: Create the Admin Profile linking to the User ID
        new_admin_profile = Admin(
            user_id=new_user.id
        )
        db.add(new_admin_profile)

        # Step C: Commit BOTH to the database permanently
        db.commit()
        
        print("🎉 Admin user AND Admin profile created successfully!")
        print("👉 Email: admin@nitc.ac.in")
        print("👉 Password: admin123")
        
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()