import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

conn_string = os.getenv("DATABASE_URL_DIRECT") or os.getenv("DATABASE_URL")
if not conn_string:
    print("No database URL provided")
    exit(1)

conn = psycopg2.connect(conn_string)
conn.autocommit = True
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE users ADD COLUMN first_login BOOLEAN DEFAULT TRUE;")
    print("Successfully added first_login column.")
except psycopg2.errors.DuplicateColumn:
    print("Column first_login already exists.")
except Exception as e:
    print(f"Error: {e}")
finally:
    cursor.close()
    conn.close()
