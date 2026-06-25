const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/notifications');

const router = express.Router();
router.use(authenticateToken);

router.get('/notifications', controller.getNotifications);
router.put('/notifications/:id/read', controller.readNotification);
router.put('/notifications/read-all', controller.readAllNotifications);

module.exports = router;
