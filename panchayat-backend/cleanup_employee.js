const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const employees = await prisma.employee.findMany({
    where: {
      user_id: null
    }
  });
  
  if (employees.length > 1) {
    console.log(`Found ${employees.length} employees with user_id=null. Deleting all but one...`);
    // Keep the first one, delete the rest
    for (let i = 1; i < employees.length; i++) {
      await prisma.employee.delete({
        where: { id: employees[i].id }
      });
      console.log(`Deleted employee ${employees[i].id}`);
    }
  } else {
    console.log("No duplicate null user_ids found.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
