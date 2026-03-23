import sqlalchemy as sa
from sqlalchemy import text
from database import engine
from models.models import Base

def migrate():
    with engine.begin() as conn:
        # 1. Rename professors to faculty
        try:
            conn.execute(text("ALTER TABLE professors RENAME TO faculty;"))
            print("Renamed professors to faculty")
        except Exception as e:
            print("Already renamed or missing professors:", getattr(e, 'orig', e))
            
        # 2. Rename professor_id to faculty_id in slots
        try:
            conn.execute(text("ALTER TABLE slots RENAME COLUMN professor_id TO faculty_id;"))
            print("Renamed slots.professor_id to faculty_id")
        except Exception as e:
            pass

        # 3. Rename professor_id to faculty_id in appointments
        try:
            conn.execute(text("ALTER TABLE appointments RENAME COLUMN professor_id TO faculty_id;"))
            print("Renamed appointments.professor_id to faculty_id")
        except Exception as e:
            pass
            
        # 4. Rename student_id to booker_id in appointments
        try:
            conn.execute(text("ALTER TABLE appointments RENAME COLUMN student_id TO booker_id;"))
            print("Renamed appointments.student_id to booker_id")
        except Exception as e:
            pass
            
        # 5. Add 'busy' to faculty
        try:
            conn.execute(text("ALTER TABLE faculty ADD COLUMN busy BOOLEAN DEFAULT FALSE;"))
            print("Added 'busy' to faculty")
        except Exception as e:
            pass
            
        # 6. Change program enum in students (update if needed)
        try:
            # Postgres specific enum alteration if needed
            # conn.execute(text("ALTER TYPE programme_enum ADD VALUE IF NOT EXISTS 'phd';"))
            pass
        except Exception as e:
            pass

    # 7. Create all missing tables / columns? SQLAlchemy create_all won't create missing columns, only missing tables!
    Base.metadata.create_all(bind=engine)
    print("Created any new tables like admins.")

if __name__ == "__main__":
    migrate()
