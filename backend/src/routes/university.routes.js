const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const {
  recommendedChallenges, adoptChallenge, createProject, dashboard, facultyInterest,
} = require('../controllers/university.controller');

router.use(authenticate, authorize('UNIVERSITY'));

router.get('/dashboard', dashboard);
router.get('/recommended', recommendedChallenges);
router.post('/challenges/:id/adopt', adoptChallenge);
router.post('/challenges/:id/interest', facultyInterest);
router.post('/projects', createProject);

module.exports = router;
