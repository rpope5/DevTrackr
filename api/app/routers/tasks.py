from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Goal, Task
from ..schemas import TaskCreate, TaskOut, TaskUpdate
from ..auth import get_current_user
from ..models import Goal, Task, User

router = APIRouter(tags=["tasks"])

@router.get("/goals/{goal_id}/tasks", response_model=list[TaskOut])
def list_tasks(goal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    return (
        db.query(Task)
        .filter(Task.goal_id == goal_id, Task.user_id == current_user.id)
        .order_by(Task.created_at.desc())
        .all()
    )

@router.post("/goals/{goal_id}/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(goal_id: int, payload: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    task = Task(user_id=current_user.id, goal_id=goal_id, title=payload.title, is_done=0)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if payload.title is not None:
        task.title = payload.title
    if payload.is_done is not None:
        task.is_done = 1 if payload.is_done else 0

    db.commit()
    db.refresh(task)
    return task

@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return None
