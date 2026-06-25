const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/gramSabha');

const router = express.Router();
router.use(authenticateToken);

router.get('/gram-sabha', controller.getGramSabha);
router.post('/gram-sabha', controller.createGramSabha);
router.post('/gram-sabha/:meeting_id/suggestion', controller.addGramSabhaSuggestion);
router.post('/gram-sabha/:meeting_id/attendance', controller.addGramSabhaAttendance);
router.put('/gram-sabha/:meeting_id/minutes', controller.updateGramSabhaMinutes);
router.post('/gram-sabha/suggestion/:suggestion_id/reply', controller.addGramSabhaSuggestionReply);

module.exports = router;
