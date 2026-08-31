const express = require('express');
const router = express.Router();
const { login, me, demoAccounts } = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth');

router.post('/login', login);
router.get('/demo-accounts', demoAccounts);
router.get('/me', authenticate, me);

module.exports = router;
