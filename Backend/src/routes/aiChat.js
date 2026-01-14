const express = require('express');
const router = express.Router();
const aiChatController = require('../app/controllers/aiChatController');
const requireAuth = require('../app/middlewares/requireAuth');

// Tất cả routes đều yêu cầu authentication
router.use(requireAuth);

// Lấy lịch sử chat
router.get('/messages', aiChatController.getMessages);

// Gửi tin nhắn
router.post('/send', aiChatController.sendMessage);

// Xóa lịch sử chat
router.delete('/messages', aiChatController.clearMessages);

module.exports = router;
