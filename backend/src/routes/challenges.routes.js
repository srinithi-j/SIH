const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const upload = require('../middleware/upload');
const {
  submitChallenge, listChallenges, getChallenge, reviewChallenge,
  sendMessage, getMessages,
} = require('../controllers/challenges.controller');

router.use(authenticate);

router.post('/', authorize('CITIZEN'), upload.single('file'), submitChallenge);
router.get('/', listChallenges); // all roles, scoped by controller logic
router.get('/:id', getChallenge);
router.post('/:id/review', authorize('GOVERNMENT'), reviewChallenge);
router.post('/:id/messages', upload.single('file'), sendMessage);
router.get('/:id/messages', getMessages);

module.exports = router;
