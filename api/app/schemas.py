from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class GoalCreate(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    description: str | None = Field(default=None, max_length=500)


class GoalUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=100)
    description: str | None = Field(default=None, max_length=500)

class GoalOut(BaseModel):
    id: int
    title: str
    description: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

