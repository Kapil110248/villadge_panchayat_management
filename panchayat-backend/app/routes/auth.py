from fastapi import APIRouter, HTTPException
from app.models.auth_models import CitizenRegister, LoginRequest
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.db import db
from datetime import datetime

router = APIRouter()

@router.post("/register")
async def register_citizen(data: CitizenRegister):
    # Check if already registered
    existing_user = await db.user.find_unique(where={'email': data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Check if already has a pending request
    existing_req = await db.registrationrequest.find_first(
        where={
            'OR': [
                {'email': data.email},
                {'aadhaar_number': data.aadhaar_number}
            ]
        }
    )
    if existing_req:
        raise HTTPException(status_code=400, detail="Registration request already exists")

    # Hash password
    hashed_pwd = get_password_hash(data.password)
    
    # Create Request
    # Note: Prisma expects DateTime object
    dob_datetime = datetime.combine(data.date_of_birth, datetime.min.time())
    
    req = await db.registrationrequest.create(
        data={
            'full_name': data.full_name,
            'date_of_birth': dob_datetime,
            'gender': data.gender,
            'aadhaar_number': data.aadhaar_number,
            'email': data.email,
            'mobile': data.mobile,
            'address': data.address,
            'village': data.village,
            'pincode': data.pincode,
            'password_hash': hashed_pwd,
            'status': 'pending'
        }
    )
    
    return {"message": "Registration request submitted successfully. Please wait for admin approval.", "request_id": req.id}

@router.post("/login")
async def login(data: LoginRequest):
    # Logic for citizen login
    if data.role == "citizen":
        # 1. Check if ACTIVE user exists
        user = await db.user.find_unique(where={'email': data.email})
        
        if not user:
            # 2. Check if Approved Request exists but user entry missing (edge case) or Pending
            req = await db.registrationrequest.find_first(where={'email': data.email})
            if req:
                if req.status == "pending":
                    raise HTTPException(status_code=401, detail="Account pending approval")
                elif req.status == "rejected":
                     raise HTTPException(status_code=401, detail="Registration rejected")
            
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not verify_password(data.password, user.password_hash):
             raise HTTPException(status_code=401, detail="Invalid credentials")
             
        # Generate Token
        token = create_access_token({"sub": user.email, "role": "citizen", "id": user.id})
        return {"access_token": token, "token_type": "bearer", "role": "citizen", "user": {"name": user.full_name, "id": user.id}}

    else:
        # Admin / Clerk Login
        user = await db.user.find_unique(where={'email': data.email})
        
        if not user or user.role != data.role:
            raise HTTPException(status_code=401, detail="Invalid credentials or incorrect role selected")
            
        if not verify_password(data.password, user.password_hash):
             raise HTTPException(status_code=401, detail="Invalid credentials")
             
        # Generate Token
        token = create_access_token({"sub": user.email, "role": user.role, "id": user.id})
        return {"access_token": token, "token_type": "bearer", "role": user.role, "user": {"name": user.full_name, "id": user.id}}

