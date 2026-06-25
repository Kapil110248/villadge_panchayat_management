const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/emergency');

const router = express.Router();
router.use(authenticateToken);

router.get('/emergency/alerts', controller.getEmergencyAlerts);
router.post('/emergency/alerts', controller.createEmergencyAlert);

module.exports = router;
