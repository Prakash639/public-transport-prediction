const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

router.get('/stats', authMiddleware, roleMiddleware(['admin']), adminController.getDashboardStats);

module.exports = router;
