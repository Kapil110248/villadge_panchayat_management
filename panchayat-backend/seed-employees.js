const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  try {
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (admin) {
      const e1 = await prisma.employee.upsert({
        where: { user_id: admin.id },
        update: {},
        create: { name: admin.full_name, designation: 'Admin', user_id: admin.id }
      });
      console.log('Seeded admin employee', e1.id);
    }
    
    const clerk = await prisma.user.findFirst({ where: { role: 'clerk' } });
    if (clerk) {
      const e2 = await prisma.employee.upsert({
        where: { user_id: clerk.id },
        update: {},
        create: { name: clerk.full_name, designation: 'Clerk', user_id: clerk.id }
      });
      console.log('Seeded clerk employee', e2.id);
    }

    // Add some random ones
    const rand = await prisma.employee.create({
      data: { name: 'Safai Karmachari 1', designation: 'Cleaner' }
    });
    console.log('Seeded random employee', rand.id);

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
