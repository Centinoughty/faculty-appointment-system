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
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        try:
            conn.execute(text("ALTER TYPE status ADD VALUE 'completed';"))
            print("Added 'completed' to status ENUM")
        except Exception as e:
            print("Skipped 'completed' (may already exist)", str(e))
            
        try:
            conn.execute(text("ALTER TYPE status ADD VALUE 'no-show';"))
            print("Added 'no-show' to status ENUM")
        except Exception as e:
            print("Skipped 'no-show' (may already exist)", str(e))
            
    print("Migration successful")
except Exception as e:
    print("Migration error:", e)
