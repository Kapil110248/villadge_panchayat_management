const { prisma } = require("./src/db");
async function main() {
  const meetings = await prisma.gramSabhaMeeting.findMany();
  console.dir(meetings, {depth: null});
}
main();
