const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verifies the Bearer JWT on protected routes and attaches the decoded
// payload ({ id, email, role, organizationId }) to req.user.
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_this_dev_secret_before_deploying');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authenticate;
