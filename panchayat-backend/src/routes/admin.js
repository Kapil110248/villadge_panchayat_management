const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/admin');

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole(['admin']));

router.get('/dashboard', adminController.getDashboard);
router.get('/registration-requests', adminController.getRegistrationRequests);
router.post('/registration-requests/:id/approve', adminController.approveRegistrationRequest);
router.post('/registration-requests/:id/reject', adminController.rejectRegistrationRequest);
router.get('/clerks', adminController.getClerks);
router.post('/clerks', adminController.createClerk);
router.get('/clerks/:id/messages', adminController.getClerkMessages);
router.post('/clerks/:id/message', adminController.sendClerkMessage);
router.put('/clerks/:id/status', adminController.updateClerkStatus);
router.delete('/clerks/:id', adminController.deleteClerk);
router.get('/complaints', adminController.getComplaints);
router.put('/complaints/:id/status', adminController.updateComplaintStatus);
router.post('/complaints/:id/message', adminController.sendComplaintMessage);
router.get('/notices', adminController.getNotices);
router.post('/notices', adminController.createNotice);
router.delete('/notices/:id', adminController.deleteNotice);
router.put('/notices/:id', adminController.updateNotice);
router.get('/schemes', adminController.getSchemes);
router.post('/schemes', adminController.createScheme);
router.delete('/schemes/:id', adminController.deleteScheme);
router.put('/schemes/:id', adminController.updateScheme);
router.put('/schemes/:id/toggle', adminController.toggleScheme);
router.get('/reports/stats', adminController.getReportStats);
router.get('/gram-sabha', adminController.getGramSabha);
router.post('/gram-sabha', adminController.createGramSabha);
router.put('/gram-sabha/:id/minutes', adminController.updateGramSabhaMinutes);
router.post('/gram-sabha/:id/broadcast-start', adminController.broadcastMeetingStart);
router.put('/gram-sabha/:id/postpone', adminController.postponeMeeting);
router.put('/gram-sabha/:id/cancel', adminController.cancelMeeting);

router.get('/scheme-applications', adminController.getSchemeApplications);
router.put('/scheme-applications/:id/approve', adminController.approveSchemeApplication);
router.put('/scheme-applications/:id/reject', adminController.rejectSchemeApplication);
router.put('/scheme-applications/:id/ready', adminController.readySchemeApplication);
router.put('/scheme-applications/:id/progress', adminController.progressSchemeApplication);

router.get('/profile', adminController.getAdminProfile);
router.put('/profile', adminController.updateAdminProfile);
router.put('/profile/password', adminController.updateAdminPassword);

module.exports = router;
