const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const { governmentAnalytics } = require('../controllers/analytics.controller');

router.get('/government', authenticate, authorize('GOVERNMENT'), governmentAnalytics);

module.exports = router;
