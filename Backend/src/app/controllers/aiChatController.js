const Groq = require('groq-sdk');
const AiMessage = require('../models/AiMessage');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const SYSTEM_PROMPT = `Bạn là trợ lý AI chuyên về sức khỏe, chạy bộ và dinh dưỡng. 
Nhiệm vụ của bạn:
- Chỉ trả lời các câu hỏi liên quan đến: sức khỏe, chạy bộ, tập luyện thể thao, chế độ ăn uống, dinh dưỡng, calo, và chăm sóc sức khỏe.
- Nếu người dùng hỏi về chủ đề không liên quan (chính trị, giải trí, công nghệ không liên quan đến sức khỏe...), hãy lịch sự từ chối và hướng dẫn họ hỏi về sức khỏe.
- Đưa ra lời khuyên thực tế, an toàn và dựa trên khoa học.
- Trả lời ngắn gọn, súc tích và dễ hiểu.
- Luôn khuyên người dùng tham khảo ý kiến bác sĩ chuyên khoa khi cần thiết.

Hãy trả lời bằng tiếng Việt một cách thân thiện và chuyên nghiệp.`;

class AiChatController {
  
  // [GET] /api/ai-chat/messages
  async getMessages(req, res) {
    try {
      const userId = req.user._id;
      
      const messages = await AiMessage.find({ userId })
        .sort({ sentAt: -1 })
        .limit(50)
        .lean();
      
      res.status(200).json({
        success: true,
        data: messages.reverse()
      });
    } catch (error) {
      console.error('Error getting AI messages:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy tin nhắn'
      });
    }
  }

  // [POST] /api/ai-chat/send
  async sendMessage(req, res) {
    try {
      const userId = req.user._id;
      const { message } = req.body;

      if (!message || message.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Tin nhắn không được để trống'
        });
      }

      // Lưu tin nhắn của user
      const userMessage = new AiMessage({
        userId,
        message: message.trim(),
        sender: 'user',
        sentAt: new Date()
      });
      await userMessage.save();

      // Lấy lịch sử chat gần đây (10 tin nhắn cuối)
      const recentMessages = await AiMessage.find({ userId })
        .sort({ sentAt: -1 })
        .limit(10)
        .lean();

      // Chuẩn bị context cho Groq
      const conversationHistory = recentMessages
        .reverse()
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.message
        }));

      // Gọi Groq API
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversationHistory
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false
      });

      const aiResponse = chatCompletion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

      // Lưu tin nhắn AI
      const aiMessage = new AiMessage({
        userId,
        message: aiResponse,
        sender: 'ai_bot',
        sentAt: new Date()
      });
      await aiMessage.save();

      res.status(200).json({
        success: true,
        data: {
          userMessage: userMessage.toObject(),
          aiMessage: aiMessage.toObject()
        }
      });

    } catch (error) {
      console.error('Error in AI chat:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xử lý tin nhắn',
        error: error.message
      });
    }
  }

  // [DELETE] /api/ai-chat/messages
  async clearMessages(req, res) {
    try {
      const userId = req.user._id;
      
      await AiMessage.deleteMany({ userId });
      
      res.status(200).json({
        success: true,
        message: 'Đã xóa toàn bộ lịch sử chat'
      });
    } catch (error) {
      console.error('Error clearing messages:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa tin nhắn'
      });
    }
  }
}

module.exports = new AiChatController();
