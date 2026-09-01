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
    note: 'Each account has its own unique password as shown below',
    accounts: [
      // Citizen accounts
      { role: 'CITIZEN', email: 'citizen1@demo.in', password: 'citizen1@123', name: 'Asha Kumari' },
      { role: 'CITIZEN', email: 'citizen2@demo.in', password: 'citizen2@123', name: 'Ramesh Kumar' },
      { role: 'CITIZEN', email: 'citizen3@demo.in', password: 'citizen3@123', name: 'Priya Singh' },
      { role: 'CITIZEN', email: 'citizen4@demo.in', password: 'citizen4@123', name: 'Suresh Yadav' },
      // Government accounts
      { role: 'GOVERNMENT', email: 'gov1@demo.in', password: 'gov1@123', name: 'Rajeev Verma' },
      { role: 'GOVERNMENT', email: 'gov2@demo.in', password: 'gov2@123', name: 'Anita Desai' },
      { role: 'GOVERNMENT', email: 'gov3@demo.in', password: 'gov3@123', name: 'Vikram Patel' },
      { role: 'GOVERNMENT', email: 'gov4@demo.in', password: 'gov4@123', name: 'Kavita Nair' },
      // University accounts
      { role: 'UNIVERSITY', email: 'uni1@demo.in', password: 'uni1@123', name: 'Dr. Meena Iyer' },
      { role: 'UNIVERSITY', email: 'uni2@demo.in', password: 'uni2@123', name: 'Prof. Rajesh Gupta' },
      { role: 'UNIVERSITY', email: 'uni3@demo.in', password: 'uni3@123', name: 'Dr. Sunil Sharma' },
      { role: 'UNIVERSITY', email: 'uni4@demo.in', password: 'uni4@123', name: 'Prof. Lakshmi Menon' },
      // Industry accounts
      { role: 'INDUSTRY', email: 'ind1@demo.in', password: 'ind1@123', name: 'Karan Shah' },
      { role: 'INDUSTRY', email: 'ind2@demo.in', password: 'ind2@123', name: 'Meera Reddy' },
      { role: 'INDUSTRY', email: 'ind3@demo.in', password: 'ind3@123', name: 'Arjun Kapoor' },
      { role: 'INDUSTRY', email: 'ind4@demo.in', password: 'ind4@123', name: 'Nisha Joshi' },
    ],
  });
}

module.exports = { login, me, demoAccounts };
