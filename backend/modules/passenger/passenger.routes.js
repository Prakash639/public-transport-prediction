const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');

// Placeholder for passenger specific routes, e.g. profile
router.get('/profile', authMiddleware, (req, res) => {
    res.json(req.user);
});

module.exports = router;
