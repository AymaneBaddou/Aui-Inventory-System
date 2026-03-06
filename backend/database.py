from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

#For local development I don't need a password, but for production I will need to have a password...
SQLALCHEMY_DATABASE_URL = "postgresql://localhost/aui_inventory_db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
