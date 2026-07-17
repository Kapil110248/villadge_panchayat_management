const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/ration');

const router = express.Router();
router.use(authenticateToken);

router.get('/ration', controller.getRation);
router.post('/ration', controller.createRation);
router.put('/ration/:id', controller.updateRation);
router.delete('/ration/:id', controller.deleteRation);

// Ration config routes
router.get('/ration-config', controller.getRationConfig);
router.put('/ration-config', controller.updateRationConfig);

module.exports = router;
