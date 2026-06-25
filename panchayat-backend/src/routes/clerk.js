const express = require('express');
const path = require('path');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/clerk');
const adminController = require('../controllers/admin');

const router = express.Router();
router.use(authenticateToken);

// Multer config for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const dir = path.join(__dirname, '../../uploads/avatars');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `clerk_${req.user.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

router.get('/clerk/dashboard/stats', controller.getClerkDashboardStats);

// Profile
router.get('/clerk/profile', controller.getProfile);
router.put('/clerk/profile', controller.updateProfile);
router.post('/clerk/profile/avatar', upload.single('avatar'), controller.uploadAvatar);

// Complaints - clerk can view all and update status
router.get('/clerk/complaints', adminController.getComplaints);
router.put('/clerk/complaints/:id/status', adminController.updateComplaintStatus);

// Notices - clerk can view, create, edit, delete notices
router.get('/clerk/notices', adminController.getNotices);
router.post('/clerk/notices', adminController.createNotice);
router.put('/clerk/notices/:id', adminController.updateNotice);
router.delete('/clerk/notices/:id', adminController.deleteNotice);

module.exports = router;
