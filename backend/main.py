from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session
from pydantic import BaseModel
import models
from database import engine, SessionLocal
import os
import shutil
from pathlib import Path
from datetime import datetime
import uuid
from passlib.context import CryptContext

models.Base.metadata.create_all(bind=engine)

# Fix missing user schema columns in existing databases
with engine.begin() as connection:
    if engine.dialect.name == 'postgresql':
        connection.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE'))
    elif engine.dialect.name == 'sqlite':
        result = connection.execute(text("PRAGMA table_info('users')")).fetchall()
        if not any(row[1] == 'is_admin' for row in result):
            connection.execute(text('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0'))

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(title="AUI Inventory API")

app.mount("/images", StaticFiles(directory="uploads"), name="images")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://aui-inventory-frontend.onrender.com", # REPLACE THIS with your actual frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Temporarily allow all URLs for deployment testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Create a default admin user if no users exist,
# and repair the default admin account if it already exists without admin rights.
with SessionLocal() as db:
    default_email = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@aui.com")
    default_password = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")
    admin_user = db.query(models.User).filter(models.User.email == default_email).first()

    if db.query(models.User).count() == 0:
        default_user = models.User(
            email=default_email,
            hashed_password=get_password_hash(default_password),
            full_name="Administrator",
            is_admin=True
        )
        db.add(default_user)
        db.commit()
    elif admin_user and not admin_user.is_admin:
        admin_user.is_admin = True
        db.commit()
    elif not db.query(models.User).filter(models.User.is_admin == True).first():
        first_user = db.query(models.User).first()
        if first_user:
            first_user.is_admin = True
            db.commit()


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

class LoginRequest(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str | None = None

class ChangePasswordRequest(BaseModel):
    email: str
    current_password: str
    new_password: str


# --- API ENDPOINTS ---
@app.post("/login/")
def login(login_request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_request.email).first()
    if not user or not verify_password(login_request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = str(uuid.uuid4())
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_email": user.email,
        "full_name": user.full_name,
        "is_admin": user.is_admin
    }


@app.post("/change-password/")
def change_password(change_request: ChangePasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == change_request.email).first()
    if not user or not verify_password(change_request.current_password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    if len(change_request.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long")

    user.hashed_password = get_password_hash(change_request.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@app.post("/users/")
def create_user(user_create: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user_create.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="A user with that email already exists")

    new_user = models.User(
        email=user_create.email,
        hashed_password=get_password_hash(user_create.password),
        full_name=user_create.full_name,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "user_id": new_user.user_id,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "is_active": new_user.is_active,
        "is_admin": new_user.is_admin
    }


@app.get("/users/")
def list_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [
        {
            "user_id": user.user_id,
            "email": user.email,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "is_admin": user.is_admin
        }
        for user in users
    ]

@app.get("/")
def read_root():
    return {"Status": "Success", "Message": "The AUI Inventory Backend is running!"}

# 1. Get all items
@app.get("/items/")
def get_items(request: Request, db: Session = Depends(get_db)):
    items = db.query(models.Item).all()
    result = []
    for item in items:
        base_url = f"{request.url.scheme}://{request.url.hostname}"
        if request.url.port and ((request.url.scheme == 'https' and request.url.port != 443) or (request.url.scheme == 'http' and request.url.port != 80)):
            base_url += f":{request.url.port}"
        item_dict = {
            "item_id": item.item_id,
            "item_name": item.item_name,
            "current_quantity": item.current_quantity,
            "picture_url": f"{base_url}/images/{item.picture_path.split('/')[-1]}" if item.picture_path else None
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

# 4. Get all operations with optional filtering
@app.get("/operations/")
def get_operations(
    db: Session = Depends(get_db),
    start_date: str = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(None, description="End date in YYYY-MM-DD format"),
    item_id: int = Query(None, description="Filter by item ID"),
    department: str = Query(None, description="Filter by department"),
    person_in_charge: str = Query(None, description="Filter by person in charge")
):
    query = db.query(models.Operation).join(models.Item)
    
    # Apply filters
    if start_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(models.Operation.operation_date >= start)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD")
    
    if end_date:
        try:
            end = datetime.strptime(end_date, "%Y-%m-%d")
            # Set end date to end of day
            end = end.replace(hour=23, minute=59, second=59)
            query = query.filter(models.Operation.operation_date <= end)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD")
    
    if item_id:
        query = query.filter(models.Operation.item_id == item_id)
    
    if department:
        query = query.filter(models.Operation.department.ilike(f"%{department}%"))
    
    if person_in_charge:
        query = query.filter(models.Operation.person_in_charge.ilike(f"%{person_in_charge}%"))
    
    operations = query.order_by(models.Operation.operation_date.desc()).all()
    
    result = []
    for op in operations:
        result.append({
            "operation_id": op.operation_id,
            "item_id": op.item_id,
            "item_name": op.item.item_name,
            "operation_type": op.operation_type,
            "quantity_moved": op.quantity_moved,
            "operation_date": op.operation_date.isoformat(),
            "person_in_charge": op.person_in_charge,
            "department": op.department
        })
    
    return result

