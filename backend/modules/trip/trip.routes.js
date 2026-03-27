const express = require('express');
const router = express.Router();
const tripController = require('./trip.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

router.post('/', authMiddleware, roleMiddleware(['driver', 'admin']), tripController.createTrip);
router.put('/:id/end', authMiddleware, roleMiddleware(['driver', 'admin']), tripController.endTrip);
router.get('/active', authMiddleware, tripController.getActiveTrips);
router.post('/:id/location', authMiddleware, roleMiddleware(['driver']), tripController.updateLocation);
router.get('/:id/location', authMiddleware, tripController.getTripLocation);

module.exports = router;
