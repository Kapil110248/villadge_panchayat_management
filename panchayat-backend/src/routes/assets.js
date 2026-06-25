const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/assets');

const router = express.Router();
router.use(authenticateToken);

router.get('/assets', controller.getAssets);
router.post('/assets', controller.createAsset);
router.delete('/assets/:id', controller.deleteAsset);

module.exports = router;
