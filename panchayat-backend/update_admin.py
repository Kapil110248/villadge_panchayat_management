import asyncio
from prisma import Prisma
from app.utils.security import get_password_hash

async def main():
    db = Prisma()
    await db.connect()
    
    email = "admin@gram.in"
    password = "password123"
    
    hashed_pwd = get_password_hash(password)
    
    await db.user.update(
        where={'email': email},
        data={'password_hash': hashed_pwd}
    )
    print(f"Admin user password updated to {password} for {email}")

    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
