const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/agriculture');

const router = express.Router();
router.use(authenticateToken);

router.get('/agriculture', controller.getAgriculture);
router.get('/agriculture/crop-info', controller.getCropInfo);
router.get('/agriculture/mandi-rates', controller.getMandiRates);
router.post('/agriculture/schemes', controller.createScheme);
router.delete('/agriculture/schemes/:id', controller.deleteScheme);
router.post('/agriculture/advisories', controller.createAdvisory);
router.delete('/agriculture/advisories/:id', controller.deleteAdvisory);

module.exports = router;
