const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/citizenDashboard');

const router = express.Router();
router.use(authenticateToken);

router.get('/citizen/dashboard/stats', controller.getDashboardStats);
router.post('/citizen/complaints', controller.createComplaint);
router.get('/citizen/complaints', controller.getComplaints);
router.put('/citizen/complaints/:id/resolve', controller.confirmComplaintResolution);

router.get('/citizen/notifications', controller.getNotifications);
router.put('/citizen/notifications/read-all', controller.markAllNotificationsRead);
router.put('/citizen/notifications/:id/read', controller.markNotificationRead);

router.get('/citizen/schemes', controller.getSchemes);
router.post('/citizen/schemes/apply', controller.applyScheme);
router.get('/citizen/schemes/my-applications', controller.getMyApplications);
router.put('/citizen/schemes/applications/:id/approve', controller.approveSchemeApplication);

router.get('/citizen/profile', controller.getProfile);
router.put('/citizen/profile', controller.updateProfile);
router.post('/citizen/family/members', controller.addFamilyMember);
router.put('/citizen/family/members/:id', controller.updateFamilyMember);

router.get('/citizen/vault-documents/:userId', controller.getVaultDocuments);
router.post('/citizen/vault-documents', controller.saveVaultDocuments);

module.exports = router;
