import { run } from '../config/db.js';

export function logAudit(userId, action, details) {
  run(
    'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
    [userId, action, details]
  );
}

export function auditLogger(action) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const details = req.auditDetails || `${action} performed by user #${req.user?.id}`;
        if (req.user?.id) {
          logAudit(req.user.id, action, details);
        }
      }
      return originalJson(data);
    };
    next();
  };
}
