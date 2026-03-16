from sqlalchemy import text
from database import engine

try:
    with engine.begin() as conn:
        conn.execute(text('ALTER TABLE users ADD COLUMN profile_picture VARCHAR(500)'))
    print("Database altered successfully")
except Exception as e:
    print(f"Error: {e}")
