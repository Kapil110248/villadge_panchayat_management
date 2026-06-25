const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/certificates');

const router = express.Router();
router.use(authenticateToken);

router.get('/certificates', controller.getCertificates);
router.post('/certificates/apply', controller.applyCertificate);
router.put('/certificates/verify/:cert_id', controller.verifyCertificate);
router.put('/certificates/approve/:cert_id', controller.approveCertificate);
router.put('/certificates/issue/:cert_id', controller.issueCertificateDirectly);
router.put('/certificates/reject/:cert_id', controller.rejectCertificate);
router.get('/certificates/verify-pub/:app_num', controller.verifyCertificatePublic);
router.delete('/certificates/:cert_id', controller.deleteCertificate);

module.exports = router;
