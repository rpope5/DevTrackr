from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..auth import create_access_token, hash_password, verify_password, get_current_user
from ..db import get_db
from ..models import User
from ..schemas import Token, UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # bcrypt limit is 72 bytes (NOT characters)
    if len(payload.password.encode("utf-8")) > 72:
        raise HTTPException(
        status_code=400,
        detail="Password must be 72 bytes or fewer (use a shorter password; avoid long passphrases/emojis).",
        )


    user = User(email=email, hashed_password=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm uses username field; we treat it as email
    email = form.username.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(subject=str(user.id))
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
