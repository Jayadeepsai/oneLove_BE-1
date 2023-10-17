const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
const logger = require('./logger');
const messages = require('./src/messages/constants');

require('dotenv').config();

// Generate a random secret key
// const secret_Key = crypto.randomBytes(32).toString('hex');
// console.log(secret_Key);

const secretKey = process.env.SECRET_KEY_JWT;

  function generateToken(userId) {
    return jwt.sign({ userId }, secretKey, { expiresIn: '24h' }); // You can adjust the expiration time
  }
// Verify a JWT token
function verifyToken(req, res, next) {
  const tokenHeader = req.headers.authorization;
  if (!tokenHeader) {
    return res.status(401).json({ message: messages.UNAUTH });
  }
  // Extract the token part
  const token = tokenHeader.split(' ')[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    logger.info("Decoded:",decoded);

    if (err) {
      logger.error('JWT verification error:', err);
      return res.status(403).json({ message: messages.FORBID });
    }
    req.userId = decoded;
    next();
  });
}



function generateRefreshToken(userId) {
    return jwt.sign({ userId }, secretKey, { expiresIn: '7d' }); // Use the same secret key
  }
// Handle token refresh
function refreshToken(req, res) {
    const refreshToken = req.body.refreshToken;
    // Verify the refresh token
    jwt.verify(refreshToken, secretKey, (err, decoded) => {
        logger.info("Decoded:",decoded);
      if (err) {
        logger.error('Refresh token verification error:', err);
        return res.status(403).json({ message: messages.FORBID });
      }
  
      // Generate a new access token
      const newAccessToken = generateToken(decoded.userId);
      logger.info('New_Access_token:',newAccessToken)
      // Send the new access token to the client
      res.json({ accessToken: newAccessToken });
    });
  }
  
  module.exports = { generateToken, verifyToken, refreshToken, generateRefreshToken };


