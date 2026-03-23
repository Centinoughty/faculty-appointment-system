import sqlite3

conn = sqlite3.connect('fams.db')
c = conn.cursor()

c.execute("SELECT id, name, role FROM users WHERE email = 'aswin_b230213cs@nitc.ac.in'")
user = c.fetchone()
if not user:
    print("User not found in DB")
else:
    user_id = user[0]
    print(f"Updating user {user_id} ({user[1]}) from {user[2]} to professor")
    c.execute("UPDATE users SET role = 'professor' WHERE id = ?", (user_id,))
    
    c.execute("DELETE FROM students WHERE user_id = ?", (user_id,))
    
    c.execute("SELECT id FROM departments LIMIT 1")
    dept = c.fetchone()
    if not dept:
        c.execute("INSERT INTO departments(name) VALUES ('Computer Science')")
        dept_id = c.lastrowid
    else:
        dept_id = dept[0]
        
    c.execute("SELECT user_id FROM faculty WHERE user_id = ?", (user_id,))
    if not c.fetchone():
        c.execute("INSERT INTO faculty(user_id, designation, office, department_id, busy) VALUES (?, 'Professor', 'Room 101', ?, 0)", (user_id, dept_id))
    
    conn.commit()
    print("Successfully promoted user to faculty via SQLite!")

conn.close()
