import sys
from sqlalchemy import text
from database import engine

with engine.begin() as conn:
    print("All faculty in DB:")
    res = conn.execute(text("SELECT * FROM faculty")).fetchall()
    for row in res:
        print(row)
