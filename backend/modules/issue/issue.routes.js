const express = require('express');
const router = express.Router();
const issueController = require('./issue.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

router.post('/', authMiddleware, roleMiddleware(['passenger', 'driver', 'admin']), issueController.createIssue);
router.get('/', authMiddleware, roleMiddleware(['admin']), issueController.getAllIssues);
router.put('/:id/status', authMiddleware, roleMiddleware(['admin']), issueController.updateIssueStatus);

module.exports = router;
