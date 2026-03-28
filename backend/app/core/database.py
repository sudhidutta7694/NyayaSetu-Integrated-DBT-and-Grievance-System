"""
Database configuration and connection management using SQLAlchemy and Alembic
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from app.core.config import settings
import logging
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
try:
    from app.models.base import Base
except ImportError:
    try:
        from backend.models.base import Base
    except ImportError:
        from models.base import Base

DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL, echo=True, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initialize database connection (tables will be managed by Alembic migrations)"""
    try:
        # Just test the connection - don't create tables
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logging.info("Database connection established successfully.")
        logging.info("Database tables will be managed by Alembic migrations.")
    except OperationalError as e:
        logging.error(f"Database connection failed: {e}")
        # Optionally, logic to create the database if not found can be added here

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Don't close the client here as it's a global instance
        pass