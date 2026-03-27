const express = require('express');
const router = express.Router();
const busController = require('./bus.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

router.post('/', authMiddleware, roleMiddleware(['admin']), busController.createBus);
router.get('/', authMiddleware, busController.getAllBuses);
router.get('/:id', authMiddleware, busController.getBusById);
router.put('/:id/status', authMiddleware, roleMiddleware(['admin', 'driver']), busController.updateBusStatus);

module.exports = router;
