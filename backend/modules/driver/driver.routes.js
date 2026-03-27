const express = require('express');
const router = express.Router();
const driverController = require('./driver.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

router.get('/my-trips', authMiddleware, roleMiddleware(['driver']), driverController.getMyTrips);

module.exports = router;
