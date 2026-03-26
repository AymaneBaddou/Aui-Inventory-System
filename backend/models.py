from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Item(Base):
    __tablename__ = "items"

    item_id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String(255), nullable=False)
    current_quantity = Column(Integer, default=0, nullable=False)
    picture_path = Column(String(500))  # Path to the uploaded image file

    # This creates a link to fetch all operations for a specific item
    operations = relationship("Operation", back_populates="item")

class Operation(Base):
    __tablename__ = "operations"

    operation_id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.item_id", ondelete="CASCADE"))
    operation_type = Column(String(10), nullable=False) # 'in' or 'out'
    quantity_moved = Column(Integer, nullable=False)
    operation_date = Column(DateTime, default=datetime.utcnow)
    person_in_charge = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)

    # This creates a link back to the parent item
    item = relationship("Item", back_populates="operations")