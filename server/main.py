from fastapi import FastAPI
from database import engine
from models import models
from routers import login, student, faculty, admin, appointment, notifications, websocket

from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles
import os


models.Base.metadata.create_all(bind=engine)


app = FastAPI(maximum_request_size=10485760) 

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:3001",
]
if allowed_origins_env:
    origins.extend([origin.strip() for origin in allowed_origins_env.split(",")])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(login.router)
app.include_router(appointment.router)
app.include_router(faculty.router)
app.include_router(student.router)
app.include_router(admin.router)
app.include_router(notifications.router)
app.include_router(websocket.router, prefix="/api")
