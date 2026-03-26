import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv()

# Securely pull the URL from the .env file, or use SQLite for local development
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./inventory.db"

# Connect to the database
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()