import asyncio
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()
    users = await db.user.find_many()
    print("Users in database:")
    for user in users:
        print(f"Email: {user.email}, Role: {user.role}, Name: {user.full_name}")
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
