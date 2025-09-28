const express = require('express');
const { chat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/message', protect, chat);

module.exports = router;