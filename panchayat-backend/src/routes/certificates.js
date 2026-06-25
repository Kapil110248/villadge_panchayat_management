const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/certificates');

const router = express.Router();

router.get('/certificates', authenticateToken, controller.getCertificates);
router.post('/certificates/apply', authenticateToken, controller.applyCertificate);
router.put('/certificates/verify/:cert_id', authenticateToken, controller.verifyCertificate);
router.put('/certificates/approve/:cert_id', authenticateToken, controller.approveCertificate);
router.put('/certificates/issue/:cert_id', authenticateToken, controller.issueCertificateDirectly);
router.put('/certificates/reject/:cert_id', authenticateToken, controller.rejectCertificate);
router.get('/certificates/verify-pub/:app_num', controller.verifyCertificatePublic);
router.delete('/certificates/:cert_id', authenticateToken, controller.deleteCertificate);

module.exports = router;
