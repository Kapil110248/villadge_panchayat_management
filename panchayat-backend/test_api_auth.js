const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const http = require('http');

const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findFirst({ where: { role: 'citizen' }});
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'your-secret-key-for-jwt-very-long-and-secure', { expiresIn: '24h' });
  
  const options = {
    hostname: 'localhost',
    port: 8001,
    path: '/api/citizen/schemes/my-applications',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`BODY: ${data}`);
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  req.end();
}

test().catch(console.error);
