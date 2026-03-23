import sys
from sqlalchemy import text
from database import engine

with engine.begin() as conn:
    print("ALL USERS IN DB:")
    res = conn.execute(text("SELECT id, email, role FROM users")).fetchall()
    for row in res:
        print(row)
