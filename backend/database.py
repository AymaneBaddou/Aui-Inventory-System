from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

#For local develoment I don't need a password, but for production I will need to have a password...
SQLALCHEMY_DATABSE_URL = "postgresql://localhost/aui_inventory_db"
engine = create_engine(SQLALCHEMY_DATABSE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
