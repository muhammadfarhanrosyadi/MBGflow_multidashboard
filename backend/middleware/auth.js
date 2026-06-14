const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'scm-secret-key-123';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

  if (!token) return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ada.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Token tidak valid atau sudah kedaluwarsa.' });
    req.user = user;
    next();
  });
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
