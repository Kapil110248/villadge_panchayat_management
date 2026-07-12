const { prisma } = require('./src/db');
const bcrypt = require('bcryptjs');

async function main() {
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('admin123456', salt);
  const citizenHash = bcrypt.hashSync('password123', salt);

  await prisma.user.update({ where: { email: 'admin@gram.in' }, data: { password_hash: adminHash } });
  console.log("Updated admin@gram.in password to: admin123456");
  
  await prisma.user.update({ where: { email: 'citizen@gram.in' }, data: { password_hash: citizenHash } });
  console.log("Updated citizen@gram.in password to: password123");
  
  await prisma.$disconnect();
  process.exit(0);
}
main().catch(console.error);
