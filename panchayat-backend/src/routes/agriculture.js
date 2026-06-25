const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/agriculture');

const router = express.Router();
router.use(authenticateToken);

router.get('/agriculture', controller.getAgriculture);

module.exports = router;
