from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers.goals import router as goals_router
from .routers.tasks import router as tasks_router
from . import models  # noqa: F401
from .routers.auth import router as auth_router

app = FastAPI(title="DevTrackr API", version="0.2.0")

allow_origins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://devtrackr.vercel.app",  # replace later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(goals_router)
app.include_router(tasks_router)
app.include_router(auth_router)

@app.get("/health")
def health():
    return {"status": "ok"}
