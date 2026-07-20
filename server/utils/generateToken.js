const jwt = require("jsonwebtoken");

// Signs a JWT for a given user id. Uses JWT_SECRET from .env (falls back to
// a dev-only secret so the server doesn't crash if it's missing, but this
// should always be set in production).
function generateToken(userId) {
  const secret = process.env.JWT_SECRET || "resumeiq-dev-secret-change-me";

  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

module.exports = generateToken;
