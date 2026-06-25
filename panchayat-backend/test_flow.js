const http = require('http');

async function testFlow() {
  const loginData = JSON.stringify({ email: "citizen@example.com", password: "password123" });
  
  const loginReq = http.request({
    hostname: 'localhost', port: 8001, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
  }, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      const token = JSON.parse(body).access_token;
      if (!token) {
        console.log("LOGIN FAILED: " + body);
        return;
      }
      
      console.log("Logged in!");
      
      const req2 = http.request({
        hostname: 'localhost', port: 8001, path: '/api/citizen/schemes', method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      }, (res2) => {
        let body2 = '';
        res2.on('data', d => body2 += d);
        res2.on('end', () => console.log("SCHEMES: " + res2.statusCode + " " + body2));
      });
      req2.end();
      
      const req3 = http.request({
        hostname: 'localhost', port: 8001, path: '/api/citizen/schemes/my-applications', method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      }, (res3) => {
        let body3 = '';
        res3.on('data', d => body3 += d);
        res3.on('end', () => console.log("APPS: " + res3.statusCode + " " + body3));
      });
      req3.end();
    });
  });
  
  loginReq.write(loginData);
  loginReq.end();
}

testFlow();
