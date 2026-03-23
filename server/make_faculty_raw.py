import sys
from sqlalchemy import text
from database import engine

def force_make_faculty():
    email = "isha_b230347ch@nitc.ac.in"
    with engine.begin() as conn:
        res = conn.execute(text("SELECT id FROM users WHERE email = :e LIMIT 1"), {"e": email}).fetchone()
        if not res:
            res = conn.execute(text("SELECT id FROM users LIMIT 1")).fetchone()
            if not res:
                print("No user found")
                return
        user_id = res[0]
        
        # update role
        conn.execute(text("UPDATE users SET role='faculty' WHERE id=:uid"), {"uid": user_id})
        
        # delete student
        conn.execute(text("DELETE FROM students WHERE user_id=:uid"), {"uid": user_id})
        
        # get or create department
        dept_res = conn.execute(text("SELECT id FROM departments LIMIT 1")).fetchone()
        if not dept_res:
            res2 = conn.execute(text("INSERT INTO departments (name) VALUES ('CS') RETURNING id"))
            dept_id = res2.fetchone()[0]
        else:
            dept_id = dept_res[0]

        # insert faculty
        try:
            conn.execute(text("DELETE FROM faculty WHERE user_id=:uid"), {"uid": user_id})
            # we try to insert minimal fields
            conn.execute(text("INSERT INTO faculty (user_id, department_id, designation, office) VALUES (:uid, :did, 'Professor', 'TBD')"), {"uid": user_id, "did": dept_id})
            print("Force inserted faculty successfully")
        except Exception as e:
            # Let's see the error if it fails
            print("ERROR on insert:", e)

if __name__ == "__main__":
    force_make_faculty()
