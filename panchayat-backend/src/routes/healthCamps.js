const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/healthCamps');

const router = express.Router();
router.use(authenticateToken);

router.get('/health-camps', controller.getHealthCamps);
router.post('/health-camps', controller.createHealthCamp);
router.delete('/health-camps/:id', controller.deleteHealthCamp);
router.post('/health-camps/register', controller.registerHealthCamp);

module.exports = router;
