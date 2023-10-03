const jwt = require('jsonwebtoken');

const crypto = require('crypto');

// Generate a random secret key
const secret_Key = crypto.randomBytes(32).toString('hex');
console.log(secret_Key);

const secretKey = secret_Key; 

// Generate a JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, secretKey, { expiresIn: '1h' }); // You can adjust the expiration time
}

// Verify a JWT token
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
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
