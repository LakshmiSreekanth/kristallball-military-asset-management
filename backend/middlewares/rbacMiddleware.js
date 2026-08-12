export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access Denied: Insufficient authorization level.'
      });
    }
    next();
  };
}

export function enforceBaseScope(req, res, next) {
  if (req.user.role === 'BASE_COMMANDER') {
    req.query.baseId = String(req.user.baseId);
    if (req.body && req.body.baseId && parseInt(req.body.baseId) !== parseInt(req.user.baseId)) {
      return res.status(403).json({ message: 'Access Denied: Cannot access other bases.' });
    }
  }
  next();
}

export function getEffectiveBaseId(req, bodyBaseId) {
  if (req.user.role === 'BASE_COMMANDER') {
    return req.user.baseId;
  }
  return bodyBaseId || req.query.baseId || null;
}
