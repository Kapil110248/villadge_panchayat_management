const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const id = "6a3f6a4d6d765e482038edb1"; // Using one of the IDs
    await prisma.notice.delete({ where: { id } });
    console.log("Deleted successfully");
  } catch(e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
