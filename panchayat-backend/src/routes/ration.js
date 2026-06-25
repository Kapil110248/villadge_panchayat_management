const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/ration');

const router = express.Router();
router.use(authenticateToken);

router.get('/ration', controller.getRation);
router.post('/ration', controller.createRation);
router.delete('/ration/:id', controller.deleteRation);

module.exports = router;
