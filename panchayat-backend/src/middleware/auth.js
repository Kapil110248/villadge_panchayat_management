const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../utils/security');
const { prisma } = require('../db');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ detail: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    
    if (!user) {
      return res.status(401).json({ detail: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ detail: "Invalid or expired token" });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ detail: "Not enough permissions" });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};
