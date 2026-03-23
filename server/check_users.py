import sys
from sqlalchemy.orm import sessionmaker
from database import engine
from models.models import User

Session = sessionmaker(bind=engine)
session = Session()

users = session.query(User).all()
print(f"Total Users: {len(users)}")
for u in users:
    print(f"Email: {u.email}, Role: {u.role}")
