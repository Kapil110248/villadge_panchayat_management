const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.complaint.findFirst({ where: { complaint_number: 'COMP-2026-4133' } }).then(c => console.log(c)).catch(console.error).finally(()=>prisma.$disconnect());
