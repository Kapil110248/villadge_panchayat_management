import asyncio
from prisma import Prisma
from app.utils.security import verify_password, get_password_hash

async def main():
    db = Prisma()
    await db.connect()
    
    email = "admin@gram.in"
    test_password = "password123"
    
    user = await db.user.find_unique(where={'email': email})
    
    if not user:
        print(f"ERROR: No user found with email {email}")
    else:
        print(f"User found: {user.email}, Role: {user.role}, Name: {user.full_name}")
        print(f"Stored hash: {user.password_hash}")
        
        result = verify_password(test_password, user.password_hash)
        print(f"Password '{test_password}' matches: {result}")
        
        # Also test with admin123
        result2 = verify_password("admin123", user.password_hash)
        print(f"Password 'admin123' matches: {result2}")
    
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
