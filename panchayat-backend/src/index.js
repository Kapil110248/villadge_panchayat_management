const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { prisma } = require('./db');

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "https://panchayat-frontend-xi.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow if origin is in our list OR is a Vercel preview deployment
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const path = require('path');
// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ message: "Welcome to Gram Panchayat API - V2", status: "running" });
});

app.use('/api/auth', require('./routes/auth'));

const { authenticateToken } = require('./middleware/auth');

const publicPaths = [
  /^\/api\/upload\/?$/,
  /^\/api\/certificates\/verify-pub\/[^/]+$/
];

const selectiveAuth = (req, res, next) => {
  // Normalize double slashes if any
  const cleanPath = req.originalUrl.replace(/\/+/g, '/').split('?')[0];
  const isPublic = publicPaths.some(pattern => pattern.test(cleanPath));
  if (isPublic) {
    return next();
  }
  return authenticateToken(req, res, next);
};

app.use('/api/admin', selectiveAuth, require('./routes/admin'));
app.use('/api', selectiveAuth);

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
