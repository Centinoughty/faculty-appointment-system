import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def migrate():
    db_url = os.getenv("DATABASE_URL")
    # Replace the async driver if present
    if db_url and db_url.startswith("postgresql+asyncpg://"):
        db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
    
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # Add description column if it doesn't exist
        cur.execute("""
            ALTER TABLE appointments ADD COLUMN IF NOT EXISTS description TEXT;
        """)
        
        conn.commit()
        print("Migration successful: added 'description' column to 'appointments' table.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
