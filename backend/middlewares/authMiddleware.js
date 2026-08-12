import { verifyToken } from '../config/jwt.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided.' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      baseId: decoded.baseId,
      username: decoded.username
    };
    next();
  } catch {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}
