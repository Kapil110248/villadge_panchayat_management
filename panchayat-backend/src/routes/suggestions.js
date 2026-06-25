const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/suggestions');

const router = express.Router();
router.use(authenticateToken);

router.get('/suggestions', controller.getSuggestions);
router.post('/suggestions', controller.createSuggestion);
router.post('/suggestions/:id/vote', controller.voteSuggestion);
router.put('/suggestions/:id/status', controller.updateSuggestionStatus);
router.delete('/suggestions/:id', controller.deleteSuggestion);

module.exports = router;
