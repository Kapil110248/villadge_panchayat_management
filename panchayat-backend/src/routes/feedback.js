const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/feedback');

const router = express.Router();
router.use(authenticateToken);

router.post('/feedback', controller.submitFeedback);
router.get('/feedback/analytics', controller.getFeedbackAnalytics);

module.exports = router;
