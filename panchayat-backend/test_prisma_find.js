const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const id = "6a3f6a4d6d765e482038edb1";
    const record = await prisma.notice.findUnique({ where: { id } });
    console.log("findUnique result:", record);
  } catch(e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
