import sys
from sqlalchemy.orm import sessionmaker
from database import engine
from models.models import Faculty

Session = sessionmaker(bind=engine)
session = Session()

count = session.query(Faculty).count()
print("Count:", count)

for f in session.query(Faculty).all():
    print("User ID from ORM:", f.user_id)
