from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date  # Importamos date para los filtros

from . import crud, models, schemas, security
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


# CORS middleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",  # React Native development server
        "http://localhost:19006",  # Expo web
        "http://localhost:3000",  # Alternative React port
        "exp://localhost:19000",  # Expo development client
        "http://192.168.1.*:8081",  # For physical devices (adjust IP range as needed)
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)
# autenticacion


@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    return crud.create_user(db=db, user=user)


@app.post("/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = crud.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(security.get_current_user)):
    return current_user


# categorias


@app.post("/categories/", response_model=schemas.Category)
def create_category_for_user(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    db_category = crud.get_user_category_by_name(
        db, user_id=current_user.id, name=category.name
    )
    if db_category:
        raise HTTPException(
            status_code=400, detail="Ya existe una categoría con este nombre"
        )
    return crud.create_user_category(db=db, category=category, user_id=current_user.id)


@app.get("/categories/", response_model=List[schemas.Category])
def read_user_categories(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    categories = crud.get_user_categories(db, user_id=current_user.id)
    return categories


# =transacciones


@app.post("/transactions/", response_model=schemas.Transaction)
def create_transaction(
    transaction: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    if transaction.category_id:
        category = crud.get_user_category(
            db, category_id=transaction.category_id, user_id=current_user.id
        )
        if not category:
            raise HTTPException(
                status_code=404,
                detail="La categoría no existe o no pertenece al usuario",
            )

    return crud.create_user_transaction(
        db=db, transaction=transaction, user_id=current_user.id
    )


@app.get("/transactions/", response_model=List[schemas.Transaction])
def read_transactions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    transactions = crud.get_transactions(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return transactions


@app.put("/transactions/{transaction_id}", response_model=schemas.Transaction)
def update_transaction(
    transaction_id: int,
    transaction_update: schemas.TransactionUpdate,  # Usamos un schema de actualización
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    db_transaction = crud.get_user_transaction(
        db, user_id=current_user.id, transaction_id=transaction_id
    )
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")

    if transaction_update.category_id:
        category = crud.get_user_category(
            db, category_id=transaction_update.category_id, user_id=current_user.id
        )
        if not category:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")

    return crud.update_transaction(
        db=db, db_transaction=db_transaction, transaction_update=transaction_update
    )


@app.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    db_transaction = crud.get_user_transaction(
        db, user_id=current_user.id, transaction_id=transaction_id
    )
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transacción no encontrada")

    crud.delete_transaction(db=db, db_transaction=db_transaction)
    return None


# dashboard


@app.get("/dashboard/summary_total", response_model=schemas.DashboardSummary)
def get_dashboard_total_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    summary = crud.get_financial_summary(db, user_id=current_user.id)
    return summary


@app.get("/dashboard/summary_by_date", response_model=schemas.DashboardSummary)
def get_dashboard_summary_by_date(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user),
):
    if start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="La fecha de inicio no puede ser posterior a la fecha de fin",
        )

    summary = crud.get_summary_by_date_range(
        db, user_id=current_user.id, start=start_date, end=end_date
    )
    return summary

