const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/map');

const router = express.Router();
router.use(authenticateToken);

router.get('/map/locations', controller.getMapLocations);

module.exports = router;
