const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.developmentProject.findMany()
  .then(projects => {
    console.log("PROJECTS_JSON_START");
    console.log(JSON.stringify(projects, null, 2));
    console.log("PROJECTS_JSON_END");
  })
  .catch(console.error)
  .finally(() => prisma.$disconnect());
