const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { prisma } = require('./db');

const app = express();

const origins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

app.use(cors({
  origin: origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['*']
}));

app.use(express.json());

const path = require('path');
// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ message: "Welcome to Gram Panchayat API - V2", status: "running" });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

const routes = [
  'notifications',
  'gramSabha',
  'projects',
  'waterSupply',
  'certificates',
  'taxes',
  'assets',
  'citizens',
  'clerk',
  'attendance',
  'feedback',
  'directory',
  'suggestions',
  'ration',
  'agriculture',
  'healthCamps',
  'emergency',
  'map',
  'citizenDashboard',
  'upload'
];

routes.forEach(route => {
  app.use('/api', require(`./routes/${route}`));
});

const PORT = process.env.PORT || 8001;

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
  }
  console.log(`Server running on port ${PORT}`);
});
