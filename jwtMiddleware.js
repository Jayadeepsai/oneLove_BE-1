const jwt = require('jsonwebtoken');
const logger = require('./logger');
const messages = require('./src/messages/constants');

require('dotenv').config();


const secretKey = process.env.SECRET_KEY_JWT;

  // function generateToken(userId) {
  //   return jwt.sign({ userId }, secretKey, { expiresIn: '24h' }); // You can adjust the expiration time
  // }

  function generateToken(userId, userType) {
    return jwt.sign({ userId, userType }, secretKey, { expiresIn: '10m' });
  }

  const tokenBlacklist = new Set();

  function addToBlacklist(token) {
      tokenBlacklist.add(token);
  }
  
  function isBlacklisted(token) {
      return tokenBlacklist.has(token);
  }

  function verifyToken(req, res, next) {
    const tokenHeader = req.headers.authorization;
    if (!tokenHeader) {
      return res.status(401).json({ message: messages.UNAUTH });
    }
    // Extract the token part
    const token = tokenHeader.split(' ')[1];

    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ message: 'Token is blacklisted' });
  }

    jwt.verify(token, secretKey, (err, decoded) => {
      logger.info("Decoded:", decoded);
  
      if (err) {
        logger.error('JWT verification error:', err);
        return res.status(403).json({ message: messages.FORBID });
      }
      req.userId = decoded.userId;
      req.userType = decoded.userType; // Add this line to extract the userType
      next();
    });
  }



function generateRefreshToken(userId, userType) {
    return jwt.sign({ userId, userType }, secretKey, { expiresIn: '7d' }); // Use the same secret key
  }


function refreshToken(req, res) {
  const refreshToken = req.body.refreshToken;
  // Verify the refresh token
  jwt.verify(refreshToken, secretKey, (err, decoded) => {
    logger.info("Decoded:", decoded);
    if (err) {
      logger.error('Refresh token verification error:', err);
      return res.status(403).json({ message: messages.FORBID });
    }

    const { userId, userType } = decoded; // Extract userId and userType from the decoded token

    // Generate a new access token with both userId and userType
    const newAccessToken = generateToken(userId, userType);
    // Send the new access token to the client
    res.json({ accessToken: newAccessToken });
  });
}


  module.exports = { generateToken, verifyToken, refreshToken, generateRefreshToken, addToBlacklist, isBlacklisted};
   


