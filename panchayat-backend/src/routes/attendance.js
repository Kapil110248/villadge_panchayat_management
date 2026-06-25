const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/attendance');

const router = express.Router();
router.use(authenticateToken);

router.get('/attendance/staff', controller.getStaffAttendance);
router.post('/attendance/mark', controller.markAttendance);
router.post('/attendance/leave', controller.requestLeave);

module.exports = router;
