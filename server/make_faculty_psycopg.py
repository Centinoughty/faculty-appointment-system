import psycopg2
conn = psycopg2.connect("postgresql://postgres:Aswin%4039@localhost:5432/FAMS")
cur = conn.cursor()
try:
    cur.execute("UPDATE users SET role='faculty' WHERE id=3")
    cur.execute("DELETE FROM students WHERE user_id=3")
    cur.execute("INSERT INTO departments (name) VALUES ('CS') ON CONFLICT DO NOTHING")
    cur.execute("SELECT id FROM departments LIMIT 1")
    did = cur.fetchone()[0]
    cur.execute("DELETE FROM faculty WHERE user_id=3")
    cur.execute("INSERT INTO faculty (user_id, department_id, designation, office, employee_id) VALUES (3, %s, 'Prof', 'TBD', 'EMP123')", (did,))
    conn.commit()
    print("Done")
except Exception as e:
    print("ERROR IS:", e)
