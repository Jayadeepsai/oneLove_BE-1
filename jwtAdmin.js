const jwt = require('jsonwebtoken');
const logger = require('./logger');
const messages = require('./src/messages/constants');

require('dotenv').config();


const secretKey = process.env.SECRET_KEY_JWT;

  function getExpirationTimestampFromTokenAdmin(token) {
    try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp) {
            return decoded.exp;
        }
    } catch (err) {
        logger.error('Error decoding token:', err.message);
    }
    return null;
}

  function generateTokenAdmin(adminId) {
    return jwt.sign({ adminId }, secretKey, { expiresIn: '24h' });
  }

  const tokenBlacklist = new Set();

function addToBlacklistAdmin(token) {
  const expirationTimestamp = getExpirationTimestampFromTokenAdmin(token);
  if (expirationTimestamp) {
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = expirationTimestamp - now;
      setTimeout(() => {
          tokenBlacklist.delete(token);
      }, expiresIn * 1000);
  }
  tokenBlacklist.add(token);
}


  function isBlacklisted(token) {
      return tokenBlacklist.has(token);
  }


function verifyTokenAdmin(req, res, next) {
  const tokenHeader = req.headers.authorization;
  if (!tokenHeader) {
      return res.status(401).json({ message: messages.UNAUTH });
  }

  const token = tokenHeader.split(' ')[1];

  if (tokenBlacklist.has(token)) {
      const now = Math.floor(Date.now() / 1000);
      const expirationTimestamp = getExpirationTimestampFromTokenAdmin(token);
      if (expirationTimestamp && now > expirationTimestamp) {
          tokenBlacklist.delete(token);
      } else {
          return res.status(401).json({ message: 'Token is blacklisted' });
      }
  }

  jwt.verify(token, secretKey, (err, decoded) => {
      logger.info("Decoded:", decoded);

      if (err) {
          logger.error('JWT verification error:', err);
          return res.status(403).json({ message: messages.FORBID });
      }

      const expirationTimestamp = getExpirationTimestampFromTokenAdmin(token);
      if (expirationTimestamp && Date.now() >= expirationTimestamp * 1000) {
          return res.status(401).json({ message: 'Token has expired' });
      }
      req.adminId = decoded.adminId;
   
      next();
  });
}


function generateRefreshTokenAdmin(adminId) {
    return jwt.sign({ adminId }, secretKey, { expiresIn: '3d' });
  }


function refreshTokenAdmin(req, res) {
  const refreshToken = req.body.refreshToken;
  jwt.verify(refreshToken, secretKey, (err, decoded) => {
    logger.info("Decoded:", decoded);
    if (err) {
      logger.error('Refresh token verification error:', err);
      return res.status(403).json({ message: messages.FORBID });
    }

    const { adminId } = decoded;
    const newAccessToken = generateTokenAdmin(adminId);
    res.json({ accessToken: newAccessToken });
  });
}


  module.exports = { generateTokenAdmin, verifyTokenAdmin, refreshTokenAdmin, generateRefreshTokenAdmin, addToBlacklistAdmin, isBlacklisted};
   


