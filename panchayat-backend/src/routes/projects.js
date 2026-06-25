const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/projects');

const router = express.Router();
router.use(authenticateToken);

router.get('/projects', controller.getProjects);
router.post('/projects', controller.createProject);
router.put('/projects/:project_id', controller.updateProject);

module.exports = router;
