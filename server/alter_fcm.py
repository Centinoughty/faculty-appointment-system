import os
import sys

# Add the server directory to sys.path to allow imports without relative dot imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, Base
from models import models

print("Adding FcmToken table...")

# This will create missing tables (e.g., fcm_tokens) without dropping the others
models.Base.metadata.create_all(bind=engine)

print("Migration successful.")
