import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import aiChatService from '../../services/aiChatService';
import './AIChat.css';

const AIChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự động scroll xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load lịch sử chat khi mount
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await aiChatService.getMessages();
      if (response.success) {
        setMessages(response.data);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Không thể tải lịch sử chat');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiChatService.sendMessage(userMsg);
      
      if (response.success) {
        setMessages(prev => [...prev, response.data.userMessage, response.data.aiMessage]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
      // Khôi phục tin nhắn nếu gửi thất bại
      setInputMessage(userMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      const response = await aiChatService.clearMessages();
      if (response.success) {
        setMessages([]);
        setShowClearConfirm(false);
      }
    } catch (err) {
      console.error('Failed to clear messages:', err);
      setError('Không thể xóa lịch sử chat');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">
        <button 
          className="back-btn" 
          onClick={() => navigate(-1)}
          title="Quay lại"
        >
          <FiArrowLeft />
        </button>
        <div className="header-content">
          <div className="header-title">
            <span className="ai-icon">🤖</span>
            <h1>AI Trợ Lý Sức Khỏe</h1>
          </div>
          <p className="header-subtitle">
            Hỏi tôi về chạy bộ, dinh dưỡng và sức khỏe
          </p>
        </div>
        {messages.length > 0 && (
          <button 
            className="clear-chat-btn" 
            onClick={() => setShowClearConfirm(true)}
            title="Xóa lịch sử chat"
          >
            🗑️
          </button>
        )}
      </div>

      <div className="ai-chat-messages">
        {messages.length === 0 && !isLoading && (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>Chào bạn!</h3>
            <p>Tôi là trợ lý AI chuyên về sức khỏe, chạy bộ và dinh dưỡng.</p>
            <p>Hãy đặt câu hỏi để bắt đầu!</p>
            <div className="example-questions">
              <p className="example-title">Ví dụ:</p>
              <div className="example-item">• "Làm thế nào để chạy bộ hiệu quả?"</div>
              <div className="example-item">• "Chế độ ăn cho người tập luyện?"</div>
              <div className="example-item">• "Cách phục hồi sau chạy bộ?"</div>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div 
            key={msg._id || index} 
            className={`message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-avatar">
              {msg.sender === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text">{msg.message}</div>
              <div className="message-time">{formatTime(msg.sentAt)}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message ai-message">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-text typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {showClearConfirm && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2>Xóa lịch sử chat?</h2>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa toàn bộ lịch sử cuộc trò chuyện?</p>
              <p className="modal-warning">⚠️ Hành động này không thể hoàn tác</p>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowClearConfirm(false)}
              >
                Hủy
              </button>
              <button 
                className="modal-btn modal-btn-confirm"
                onClick={handleClearChat}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <form className="ai-chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="ai-chat-input"
          placeholder="Nhập câu hỏi của bạn..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="ai-chat-send-btn"
          disabled={!inputMessage.trim() || isLoading}
        >
          {isLoading ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
};

export default AIChat;
