from sqlalchemy import text
from database import engine

def main():
    try:
        with engine.begin() as conn:
            # appointments
            try:
                conn.execute(text("ALTER TABLE appointments ADD COLUMN rejection_reason TEXT;"))
                print("Added rejection_reason to appointments")
            except Exception as e:
                print("Column appointments.rejection_reason might already exist:", str(e).split('\n')[0])
            
            # professors
            try:
                conn.execute(text("ALTER TABLE professors ADD COLUMN designation VARCHAR(255);"))
                print("Added designation to professors")
            except Exception as e:
                print("Column designation might already exist:", str(e).split('\n')[0])
            try:
                conn.execute(text("ALTER TABLE professors ADD COLUMN office VARCHAR(255);"))
                print("Added office to professors")
            except Exception as e:
                print("Column office might already exist:", str(e).split('\n')[0])
            try:
                conn.execute(text("ALTER TABLE professors ADD COLUMN employee_id VARCHAR(100);"))
                print("Added employee_id to professors")
            except Exception as e:
                print("Column employee_id might already exist:", str(e).split('\n')[0])
            try:
                conn.execute(text("ALTER TABLE professors ADD COLUMN keywords TEXT DEFAULT '';"))
                print("Added keywords to professors")
            except Exception as e:
                print("Column keywords might already exist:", str(e).split('\n')[0])

    except Exception as e:
        print("Error:", e)
        
    # Also create any missing tables
    from models.models import Base
    Base.metadata.create_all(bind=engine)
    print("Ensured all new tables are created.")

if __name__ == "__main__":
    main()
