const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.taxRecord.findMany({ include: { citizen: true } })
  .then(taxes => {
    console.log("TAXES_JSON_START");
    console.log(JSON.stringify(taxes, null, 2));
    console.log("TAXES_JSON_END");
  })
  .catch(console.error)
  .finally(() => prisma.$disconnect());
