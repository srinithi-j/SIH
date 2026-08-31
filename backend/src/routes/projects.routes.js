const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const { getProject, updateStatus, recordImpact } = require('../controllers/projects.controller');

router.use(authenticate);

router.get('/:id', getProject); // any authenticated role can view
router.patch('/:id/status', authorize('UNIVERSITY', 'GOVERNMENT'), updateStatus);
router.post('/:id/impact', authorize('UNIVERSITY', 'GOVERNMENT'), recordImpact);

module.exports = router;
