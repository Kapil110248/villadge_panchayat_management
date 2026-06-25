const { getDashboardStats } = require('./src/controllers/citizenDashboard');

const req = {
  user: { id: 3 } // Use an existing citizen ID
};

const res = {
  json: (data) => console.log('SUCCESS:', data),
  status: (code) => {
    console.log('STATUS:', code);
    return { json: (data) => console.log('ERROR JSON:', data) };
  }
};

async function test() {
  await getDashboardStats(req, res);
}

test().catch(console.error);
