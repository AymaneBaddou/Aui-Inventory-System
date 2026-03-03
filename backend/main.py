from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import models
from database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AUI Inventory API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # Vite's default ports
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
    picture: str | None = None

class OperationCreate(BaseModel):
    item_id: int
    operation_type: str
    quantity_moved: int
    person_in_charge: str


# --- API ENDPOINTS ---
@app.get("/")
def read_root():
    return {"Status": "Success", "Message": "The AUI Inventory Backend is running!"}

# 1. Get all items
@app.get("/items/")
def get_items(db: Session = Depends(get_db)):
    return db.query(models.Item).all()

# 2. Add a new item to the system (quantity starts at 0)
@app.post("/items/")
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    # Notice we DO NOT pass quantity here! 
    # The database will automatically set current_quantity to 0.
    new_item = models.Item(item_name=item.item_name, picture=item.picture)
    
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
        person_in_charge=op.person_in_charge
    )
    
    db.add(new_op)
    db.commit()
    db.refresh(new_op)
    
    return {"message": "Operation successful", "operation": new_op, "new_quantity": db_item.current_quantity}

