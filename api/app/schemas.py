from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

class UserCreate(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=72)

class UserOut(BaseModel):
    id: int
    email: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class GoalCreate(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    description: str | None = Field(default=None, max_length=500)


class GoalUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=100)
    description: str | None = Field(default=None, max_length=500)

class GoalOut(BaseModel):
    id: int
    user_id: int
    title: str
    description: str | None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
    
class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)

class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    is_done: bool | None = None

class TaskOut(BaseModel):
    id: int
    user_id: int
    goal_id: int
    title: str
    is_done: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

