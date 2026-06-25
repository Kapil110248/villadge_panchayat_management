const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/taxes');

const router = express.Router();
router.use(authenticateToken);

router.get('/taxes', controller.getTaxes);
router.post('/taxes/pay', controller.payTax);
router.put('/taxes/:tax_id/approve', controller.approveTax);
router.post('/taxes/levy', controller.levyTax);
router.post('/taxes/generate', controller.generateTaxes);
router.get('/taxes/analytics', controller.getTaxAnalytics);

module.exports = router;
