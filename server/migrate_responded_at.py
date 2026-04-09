from database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        print("Migrating database...")
        try:
            conn.execute(text("ALTER TABLE appointments ADD COLUMN responded_at TIMESTAMP;"))
            conn.commit()
            print("Successfully added responded_at column to appointments table.")
        except Exception as e:
            if "already exists" in str(e):
                print("Column responded_at already exists.")
            else:
                print(f"Error: {e}")

if __name__ == "__main__":
    migrate()
