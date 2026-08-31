const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const { projectsSeekingSupport, expressInterest } = require('../controllers/industry.controller');

router.use(authenticate, authorize('INDUSTRY'));

router.get('/projects', projectsSeekingSupport);
router.post('/projects/:id/interest', expressInterest);

module.exports = router;
