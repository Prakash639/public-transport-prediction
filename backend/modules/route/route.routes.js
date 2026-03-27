const express = require('express');
const router = express.Router();
const routeController = require('./route.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

router.post('/', authMiddleware, roleMiddleware(['admin']), routeController.createRoute);
router.get('/search', authMiddleware, routeController.searchRoutes);
router.get('/', authMiddleware, routeController.getAllRoutes);
router.get('/:id', authMiddleware, routeController.getRouteById);

module.exports = router;
