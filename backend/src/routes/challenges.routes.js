const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const {
  submitChallenge, listChallenges, getChallenge, reviewChallenge,
} = require('../controllers/challenges.controller');

router.use(authenticate);

router.post('/', authorize('CITIZEN'), submitChallenge);
router.get('/', listChallenges); // all roles, scoped by controller logic
router.get('/:id', getChallenge);
router.post('/:id/review', authorize('GOVERNMENT'), reviewChallenge);

module.exports = router;
