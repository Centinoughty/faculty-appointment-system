from sqlalchemy import text
from database import engine

def fix():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN name VARCHAR(255) DEFAULT '';"))
            print("Added name")
        except Exception as e:
            print(e)
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN picture VARCHAR(255);"))
            print("Added picture")
        except Exception as e:
            print(e)

if __name__ == "__main__":
    fix()
