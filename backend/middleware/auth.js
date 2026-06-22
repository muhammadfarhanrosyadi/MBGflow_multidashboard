const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'scm-secret-key-123';

// ── Role hierarchy map ────────────────────────────────────────────────────────
// Maps legacy DB role values to internal roles.
// DB role: 'admin'  → treated as super_admin + procurement
// DB role: 'user'   → treated as viewer
const ROLE_PERMISSIONS = {
  super_admin:  ['super_admin', 'procurement', 'finance', 'logistics', 'production', 'viewer'],
  admin:        ['super_admin', 'procurement', 'finance', 'logistics', 'production', 'viewer'],
  procurement:  ['procurement', 'viewer'],
  finance:      ['finance', 'viewer'],
  logistics:    ['logistics', 'viewer'],
  production:   ['production', 'viewer'],
  viewer:       ['viewer'],
  user:         ['viewer'],
};

/**
 * Middleware: verify JWT and attach decoded user to req.user
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ada.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token tidak valid atau sudah kedaluwarsa.' });
    }
    req.user = user;
    next();
  });
}

/**
 * Middleware factory: restrict access to specific roles.
 * Usage: router.post('/approve', authenticateToken, requireRole('super_admin', 'procurement'), handler)
 *
 * @param {...string} allowedRoles - One or more allowed role strings
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
    }

    const userRole = req.user.role || 'viewer';
    const userPermissions = ROLE_PERMISSIONS[userRole] || ['viewer'];

    // Check if any allowed role is in the user's permission set
    const hasPermission = allowedRoles.some(role => userPermissions.includes(role));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Role '${userRole}' tidak memiliki izin untuk aksi ini.`,
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  JWT_SECRET,
};
