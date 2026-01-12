from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db import db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to DB on startup
    try:
        await db.connect()
        print("✅ Database connected successfully")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
    
    yield
    
    # Disconnect on shutdown
    if db.is_connected():
        await db.disconnect()
        print("Database disconnected")

app = FastAPI(
    title="Village Panchayat API",
    description="Backend API for Gram Panchayat Sarahi Digital Portal",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = [
    "http://localhost:3000",  # Next.js Frontend
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Gram Panchayat API", "status": "running"}

from app.routes import auth
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

