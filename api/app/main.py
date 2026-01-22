from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from . import models  # noqa: F401
from .routers.goals import router as goals_router

app = FastAPI(title="DevTrackr API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup (simple for now; later we’ll switch to Alembic migrations)


@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(goals_router)
