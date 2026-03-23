import sys
from sqlalchemy.orm import sessionmaker
from database import engine
from models.models import Faculty

Session = sessionmaker(bind=engine)
session = Session()

try:
    faculty_list = session.query(Faculty).all()
    results = []
    for f in faculty_list:
        results.append({
            "id": f.user_id,
            "name": f.user.name if f.user else None,
            "email": f.user.email if f.user else None,
            "department": f.department.name if f.department else None
        })
    print(results)
except Exception as e:
    print("ERROR:", e)
