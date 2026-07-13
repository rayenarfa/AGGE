import { verifyToken } from '../utils/auth.js';

/**
 * Middleware to authenticate requests via JWT access token in cookies
 */
export function authenticateToken(req, res, next) {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ error: 'Access token missing', code: 'TOKEN_MISSING' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid access token', code: 'TOKEN_INVALID' });
  }
}

/**
 * Middleware to restrict endpoints based on user roles
 * @param {string[]} allowedRoles List of roles permitted to access the endpoint
 */
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized access', code: 'UNAUTHORIZED' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden access', code: 'FORBIDDEN' });
    }

    next();
  };
}
