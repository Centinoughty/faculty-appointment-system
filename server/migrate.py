import os
import sys

# manually load .env to avoid dotenv dependency
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                parts = line.split('=', 1)
                if len(parts) == 2:
                    os.environ[parts[0]] = parts[1]

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE appointments ADD COLUMN rejection_reason VARCHAR(500);"))
        conn.commit()
    print("Migration successful")
except Exception as e:
    print("Migration error:", e)
