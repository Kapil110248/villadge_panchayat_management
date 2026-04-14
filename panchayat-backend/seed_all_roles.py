import asyncio
from prisma import Prisma
from app.utils.security import get_password_hash

async def main():
    db = Prisma()
    await db.connect()
    
    password = "password123"
    hashed_pwd = get_password_hash(password)
    
    users_to_create = [
        {
            'email': 'admin@gram.in',
            'role': 'admin',
            'full_name': 'Gram Admin',
            'mobile': '8888888888'
        },
        {
            'email': 'clerk@gram.in',
            'role': 'clerk',
            'full_name': 'Gram Clerk',
            'mobile': '7777777777'
        },
        {
            'email': 'citizen@gram.in',
            'role': 'citizen',
            'full_name': 'Gram Citizen',
            'mobile': '6666666666'
        }
    ]
    
    for user_data in users_to_create:
        existing_user = await db.user.find_unique(where={'email': user_data['email']})
        
        if existing_user:
            # Update existing user to ensure password and role are correct
            await db.user.update(
                where={'email': user_data['email']},
                data={
                    'password_hash': hashed_pwd,
                    'role': user_data['role'],
                    'is_active': True
                }
            )
            print(f"Updated user: {user_data['email']}")
        else:
            # Create new user
            await db.user.create(
                data={
                    'email': user_data['email'],
                    'password_hash': hashed_pwd,
                    'role': user_data['role'],
                    'full_name': user_data['full_name'],
                    'mobile': user_data['mobile'],
                    'is_active': True
                }
            )
            print(f"Created user: {user_data['email']}")

    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
