from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .db import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    tasks = relationship(
        "Task",
        back_populates="goal",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String, nullable=False)
    is_done = Column(Integer, default=0, nullable=False) # 0 and 1 works good with sqlite
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    goal = relationship("Goal", back_populates="tasks")
