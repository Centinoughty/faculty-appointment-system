import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()
url = os.getenv("DATABASE_URL")
if not url:
    print("NO DB URL")
else:
    print(f"Connecting to {url}")
    engine = create_engine(url)
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE appointments ADD COLUMN rejection_reason TEXT;"))
            conn.commit()
            print("Successfully added rejection_reason")
        except Exception as e:
            print("Failed to map column:", e)
