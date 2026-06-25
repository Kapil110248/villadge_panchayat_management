const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/waterSupply');

const router = express.Router();
router.use(authenticateToken);

router.get('/water-supply', controller.getWaterSupply);
router.post('/water-supply', controller.createWaterSupply);
router.put('/water-supply/:schedule_id', controller.updateWaterSupply);
router.delete('/water-supply/:schedule_id', controller.deleteWaterSupply);
router.get('/water-supply/tanks', controller.getWaterTanks);
router.post('/water-supply/tanks', controller.createWaterTank);
router.delete('/water-supply/tanks/:tank_id', controller.deleteWaterTank);

module.exports = router;
