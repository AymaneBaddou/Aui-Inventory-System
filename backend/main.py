from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel
import models
from database import engine, SessionLocal
import os
import shutil
from pathlib import Path

models.Base.metadata.create_all(bind=engine)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(title="AUI Inventory API")

app.mount("/images", StaticFiles(directory="uploads"), name="images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Temporarily allow all URLs for deployment testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try: 
        yield db
    finally:
        db.close()

# --- PYDANTIC SCHEMAS (For validating incoming data) ---
class ItemCreate(BaseModel):
    item_name: str

class OperationCreate(BaseModel):
    item_id: int
    operation_type: str
    quantity_moved: int
    person_in_charge: str
    department: str


# --- API ENDPOINTS ---
@app.get("/")
def read_root():
    return {"Status": "Success", "Message": "The AUI Inventory Backend is running!"}

# 1. Get all items
@app.get("/items/")
def get_items(db: Session = Depends(get_db)):
    items = db.query(models.Item).all()
    result = []
    for item in items:
        item_dict = {
            "item_id": item.item_id,
            "item_name": item.item_name,
            "current_quantity": item.current_quantity,
            "picture_url": f"http://127.0.0.1:8000/images/{item.picture_path.split('/')[-1]}" if item.picture_path else None
        }
        result.append(item_dict)
    return result

# 2. Add a new item to the system (quantity starts at 0)
@app.post("/items/")
def create_item(
    item_name: str = Form(...),
    picture: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    picture_path = None
    if picture:
        # Save the uploaded file
        file_path = UPLOAD_DIR / f"{item_name.replace(' ', '_')}_{picture.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(picture.file, buffer)
        picture_path = str(file_path)
    
    new_item = models.Item(item_name=item_name, picture_path=picture_path)
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

# 3. Log an In/Out Operation AND update item quantity
@app.post("/operations/")
def create_operation(op: OperationCreate, db: Session = Depends(get_db)):
    # Find the item we are operating on
    db_item = db.query(models.Item).filter(models.Item.item_id == op.item_id).first()
    
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Handle the math based on 'in' or 'out'
    if op.operation_type == "in":
        db_item.current_quantity += op.quantity_moved
    elif op.operation_type == "out":
        if db_item.current_quantity < op.quantity_moved:
            raise HTTPException(status_code=400, detail="Not enough stock available!")
        db_item.current_quantity -= op.quantity_moved
    else:
        raise HTTPException(status_code=400, detail="Operation type must be 'in' or 'out'")

    # Record the operation in the history log
    new_op = models.Operation(
        item_id=op.item_id,
        operation_type=op.operation_type,
        quantity_moved=op.quantity_moved,
        person_in_charge=op.person_in_charge,
        department=op.department
    )
    
    db.add(new_op)
    db.commit()
    db.refresh(new_op)
    
    return {"message": "Operation successful", "operation": new_op, "new_quantity": db_item.current_quantity}

