from sqlalchemy import Column, String, Float, DateTime, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .database import Base
import datetime
import enum

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    transactions = relationship("Transaction", back_populates="owner")
    categories = relationship("Category", back_populates="owner")

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="categories")
    
    transactions = relationship("Transaction", back_populates="category")

class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, index=True)
    amount = Column(Float, nullable=False) 
    type = Column(Enum(TransactionType), nullable=False) # 'income' o 'expense'
    date = Column(DateTime, default=datetime.datetime.utcnow)
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="transactions")
    
    category_id = Column(Integer, ForeignKey("categories.id"))
    category = relationship("Category", back_populates="transactions")