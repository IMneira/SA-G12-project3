from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from .models import TransactionType

# Esquemas Base

class TransactionBase(BaseModel):
    description: Optional[str] = None
    amount: float
    type: TransactionType
    category_id: Optional[int] = None
    date: Optional[datetime] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[TransactionType] = None
    category_id: Optional[int] = None
    date: Optional[datetime] = None

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

# Esquemas de Respuesta

class Category(CategoryBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True

class Transaction(TransactionBase):
    id: int
    owner_id: int
    category: Optional[Category] = None 

    class Config:
        orm_mode = True

class User(UserBase):
    id: int

    class Config:
        orm_mode = True

# Esquemas de Autenticación

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[EmailStr] = None

# Esquemas de Dashboard

class DashboardSummary(BaseModel):
    total_income: float
    total_expense: float
    balance: float