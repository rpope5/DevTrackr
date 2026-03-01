from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

API_DIR = Path(__file__).resolve().parents[1]  # points to .../api
DB_PATH = API_DIR / "devtrackr.db"

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./devtrackr.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH.as_posix()}"


db_url = os.getenv("DATABASE_URL", "sqlite:///./devtrackr.db")
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

SQLALCHEMY_DATABASE_URL = db_url

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
