import sys
import psycopg2

conn = psycopg2.connect("postgresql://postgres:Aswin%4039@localhost:5432/FAMS")
cur = conn.cursor()
try:
    # 1. Ensure `isha` is a student
    cur.execute("SELECT id FROM users WHERE email='isha_b230347ch@nitc.ac.in'")
    isha_res = cur.fetchone()
    if isha_res:
        uid = isha_res[0]
        cur.execute("UPDATE users SET role='student' WHERE id=%s", (uid,))
        cur.execute("DELETE FROM faculty WHERE user_id=%s", (uid,))
        # insert into students
        cur.execute("INSERT INTO students (user_id, roll_number, year, programme) VALUES (%s, 'B230347CH', 2, 'btech') ON CONFLICT DO NOTHING", (uid,))

    # 2. Ensure `aswin` is a faculty
    cur.execute("SELECT id FROM users WHERE email='aswin_b230213cs@nitc.ac.in'")
    aswin_res = cur.fetchone()
    if aswin_res:
        uid = aswin_res[0]
        cur.execute("UPDATE users SET role='faculty' WHERE id=%s", (uid,))
        cur.execute("DELETE FROM students WHERE user_id=%s", (uid,))
        # ensure mapped
        cur.execute("SELECT id FROM departments LIMIT 1")
        did = cur.fetchone()
        if did:
            cur.execute("INSERT INTO faculty (user_id, department_id, designation, office) VALUES (%s, %s, 'Professor', 'Office') ON CONFLICT DO NOTHING", (uid, did[0]))

    conn.commit()
    print("Fixed roles! isha is student, aswin is faculty.")
except Exception as e:
    print("Error:", e)
finally:
    conn.close()
