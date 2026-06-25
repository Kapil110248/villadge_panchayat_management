const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const http = require('http');

const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findFirst({ where: { role: 'citizen' } });
  if (!user) {
    console.log("No citizen found");
    return;
  }
  
  // Use the EXACT same key as security.js
  const SECRET_KEY = process.env.SECRET_KEY || "YOUR_SUPER_SECRET_KEY_FOR_JWT";
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
  
  console.log("Token generated:", token);
  
  const options = {
    hostname: 'localhost',
    port: 8001,
    path: '/api/citizen/schemes',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  };

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`BODY: ${data}`);
    });
  });
  req.on('error', (e) => console.error(e));
  req.end();
}

test().catch(console.error).finally(() => prisma.$disconnect());
