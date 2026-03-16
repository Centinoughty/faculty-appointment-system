from sqlalchemy import text
from database import engine

def main():
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE students ADD COLUMN semester VARCHAR(50);"))
        print("Successfully added semester column to students table")
    except Exception as e:
        print("Error or column already exists:", e)

if __name__ == "__main__":
    main()
