// Simple role-based access control middleware factory.
// Usage: router.get('/path', authenticate, authorize('GOVERNMENT'), handler)
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Role '${req.user.role}' is not permitted to access this resource` });
    }
    next();
  };
}

module.exports = authorize;
