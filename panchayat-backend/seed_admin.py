import asyncio
from prisma import Prisma
from app.utils.security import get_password_hash

async def main():
    db = Prisma()
    await db.connect()

    email = "admin@panchayat.com"
    password = "admin123"
    
    # Check if admin exists
    existing_admin = await db.user.find_unique(where={'email': email})
    
    if existing_admin:
        print(f"❌ Admin user {email} already exists.")
    else:
        hashed_pwd = get_password_hash(password)
        
        await db.user.create(
            data={
                'email': email,
                'password_hash': hashed_pwd,
                'role': 'admin',
                'full_name': 'Super Admin',
                'mobile': '9999999999',
                'is_active': True
            }
        )
        print(f"✅ Admin user created successfully!")
        print(f"📧 Email: {email}")
        print(f"🔑 Password: {password}")

    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
