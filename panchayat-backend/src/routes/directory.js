const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/directory');

const router = express.Router();
router.use(authenticateToken);

router.get('/directory', controller.getDirectory);

module.exports = router;
