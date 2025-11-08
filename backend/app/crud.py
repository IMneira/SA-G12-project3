from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_
from . import models, schemas, security
from .models import TransactionType
from datetime import date

# user

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    try:
        pw = user.password
        pw_type = type(pw)
        pw_repr = repr(pw)
        pw_bytes_len = len(pw.encode("utf-8")) if isinstance(pw, str) else len(repr(pw).encode("utf-8"))
        print(f"[DEBUG] create_user password type={pw_type} bytes_len={pw_bytes_len} repr={pw_repr}")
    except Exception as _e:
        print(f"[DEBUG] create_user password inspection error: {_e}")
        
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email=email)
    if not user:
        return False
    if not security.verify_password(password, user.hashed_password):
        return False
    return user

# category

def get_user_category(db: Session, user_id: int, category_id: int):
    return db.query(models.Category).filter(
        models.Category.id == category_id, 
        models.Category.owner_id == user_id
    ).first()

def get_user_category_by_name(db: Session, user_id: int, name: str):
    return db.query(models.Category).filter(
        models.Category.name == name,
        models.Category.owner_id == user_id
    ).first()

def get_user_categories(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Category).filter(
        models.Category.owner_id == user_id
    ).offset(skip).limit(limit).all()

def create_user_category(db: Session, category: schemas.CategoryCreate, user_id: int):
    db_category = models.Category(**category.dict(), owner_id=user_id)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# transaction

def get_user_transaction(db: Session, user_id: int, transaction_id: int):
    return db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.owner_id == user_id
    ).first()

def get_transactions(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Transaction).filter(
        models.Transaction.owner_id == user_id
    ).order_by(models.Transaction.date.desc()).offset(skip).limit(limit).all()

def create_user_transaction(db: Session, transaction: schemas.TransactionCreate, user_id: int):
    db_transaction = models.Transaction(
        **transaction.dict(), 
        owner_id=user_id
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def update_transaction(db: Session, db_transaction: models.Transaction, transaction_update: schemas.TransactionUpdate):
    update_data = transaction_update.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_transaction, key, value)
        
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def delete_transaction(db: Session, db_transaction: models.Transaction):
    db.delete(db_transaction)
    db.commit()
    return

# dashboard

def _get_summary_query(db: Session, user_id: int, start_date: date = None, end_date: date = None):    
    income_expression = case(
        (models.Transaction.type == TransactionType.INCOME, models.Transaction.amount),
        else_=0
    )
    expense_expression = case(
        (models.Transaction.type == TransactionType.EXPENSE, models.Transaction.amount),
        else_=0
    )

    query = db.query(
        func.sum(income_expression).label("total_income"),
        func.sum(expense_expression).label("total_expense")
    ).filter(models.Transaction.owner_id == user_id)

    if start_date and end_date:
        query = query.filter(
            models.Transaction.date.between(start_date, end_date)
        )
    
    summary = query.first()
    
    total_income = summary.total_income or 0.0
    total_expense = summary.total_expense or 0.0
    balance = total_income - total_expense

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance
    }

def get_financial_summary(db: Session, user_id: int):
    return _get_summary_query(db, user_id)

def get_summary_by_date_range(db: Session, user_id: int, start: date, end: date):
    return _get_summary_query(db, user_id, start_date=start, end_date=end)