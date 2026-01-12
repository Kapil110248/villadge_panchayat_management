from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

class CitizenRegister(BaseModel):
    full_name: str
    date_of_birth: date
    gender: str
    aadhaar_number: str
    email: EmailStr
    mobile: str
    address: str
    village: str = "Sarahi"
    pincode: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str = "citizen"
