const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/citizens');

const router = express.Router();
router.use(authenticateToken);

router.get('/citizens', controller.getCitizens);
router.post('/citizens', controller.createCitizen);
router.put('/citizens/:id', controller.updateCitizen);
router.delete('/citizens/:id', controller.deleteCitizen);

module.exports = router;
