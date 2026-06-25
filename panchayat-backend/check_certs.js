const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const certs = await prisma.certificate.findMany({
    orderBy: { submitted_at: 'desc' },
    take: 5
  });
  console.log(certs);
}

main().finally(() => prisma.$disconnect());
