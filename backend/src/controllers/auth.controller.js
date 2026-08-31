const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// POST /api/auth/login
// Demo authentication backed by real bcrypt-hashed passwords in Postgres,
// but structured exactly like a production JWT login so it's a drop-in
// upgrade path (no demo-only shortcuts baked into the token shape).
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'change_this_dev_secret_before_deploying', {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type) VALUES ($1, 'LOGIN', 'user')`,
      [user.id]
    );

    res.json({ token, user: payload });
  } catch (err) {
    console.error('[auth] login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
}

// GET /api/auth/me
async function me(req, res) {
  res.json({ user: req.user });
}

// GET /api/auth/demo-accounts
// Convenience endpoint so the frontend login page can list demo credentials.
function demoAccounts(req, res) {
  res.json({
    note: 'All demo accounts share the password: demo1234',
    accounts: [
      { role: 'CITIZEN', email: 'citizen@demo.in' },
      { role: 'GOVERNMENT', email: 'gov@demo.in' },
      { role: 'UNIVERSITY', email: 'university@demo.in' },
      { role: 'INDUSTRY', email: 'industry@demo.in' },
    ],
  });
}

module.exports = { login, me, demoAccounts };
