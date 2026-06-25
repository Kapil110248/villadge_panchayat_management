const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY || "YOUR_SUPER_SECRET_KEY_FOR_JWT";
const ALGORITHM = "HS256";
const ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24; // 24 hours

function getPasswordHash(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

function createAccessToken(data) {
  const expiresIn = ACCESS_TOKEN_EXPIRE_MINUTES * 60; // in seconds
  return jwt.sign(data, SECRET_KEY, { algorithm: ALGORITHM, expiresIn });
}

module.exports = {
  getPasswordHash,
  verifyPassword,
  createAccessToken,
  SECRET_KEY
};
