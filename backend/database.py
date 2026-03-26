import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load the environment variables from the .env file we just created
load_dotenv()

# Securely pull the Supabase URL instead of hardcoding localhost
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Connect to the database using the cloud URL
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()