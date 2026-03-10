from fastapi import FastAPI
from database import engine
import models

from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles
import os

models.Base.metadata.create_all(bind=engine)


app = FastAPI(maximum_request_size=10485760) 

origins=[
    '*'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
