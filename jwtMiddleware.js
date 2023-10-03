const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate a random secret key
const secret_Key = crypto.randomBytes(32).toString('hex');
console.log(secret_Key);

const secretKey = secret_Key;

// Generate a JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, secretKey, { expiresIn: '24h' }); // You can adjust the expiration time
}

// Verify a JWT token
function verifyToken(req, res, next) {
  const tokenHeader = req.headers.authorization;

  if (!tokenHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Extract the token part
  const token = tokenHeader.split(' ')[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    console.log('Token:', token);
    console.log('Secret Key:', secretKey);
    console.log('Decoded token:', decoded);

    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ message: 'Forbidden' });
    }

    req.userId = decoded;
    next();
  });
}

module.exports = { generateToken, verifyToken };
