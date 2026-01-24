import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

import aiChatService from "../../services/aiChatService";
import packageService from "../../services/packageService";
import { PayOSService } from "../../services/payosService";
import QRCode from "qrcode";

import toast from "react-hot-toast";
import "./AIChat.css";

// ===== helpers =====
const safeSrc = (v) => (typeof v === "string" && v.trim() ? v : null);

const isPackageActive = (pkg) => {
  if (!pkg || pkg.status !== "valid") return false;
  if (!pkg.startedAt || !pkg.endedAt) return false;
  const now = new Date();
  return now >= new Date(pkg.startedAt) && now <= new Date(pkg.endedAt);
};

// ===== Modal QR (Cancel only) =====
function PaymentQRModal({ open, onClose, loading, error, qrURL }) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <h2>📲 Pay via QR</h2>
        </div>

        <div className="modal-body" style={{ display: "grid", gap: 14 }}>
          <div className="premium-features">
            <div className="premium-price">299.000 VNĐ / 1 Month</div>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            {loading ? (
              <div className="text-center py-12 text-black/60">
                <div className="inline-block">
                  <div className="animate-spin h-8 w-8 border-4 border-black/20 border-t-black/60 rounded-full"></div>
                </div>
                <p className="mt-2">Generating QR code...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>{error}</p>
              </div>
            ) : (
              <img
                src={safeSrc(qrURL) ?? undefined}
                alt="QR Code"
                className="w-full rounded"
              />
            )}
          </div>

          <p className="modal-warning" style={{ margin: 0 }}>
            After completing the payment, please wait 10 seconds for the system
            to confirm.
          </p>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Premium Gate UI (giống Home) =====
function UpgradePremiumGate({ onUpgrade }) {
  const navigate = useNavigate();
  return (
    <div className="ai-chat-container flex flex-col items-center justify-center">
      <div style={{ padding: 16 }}>
        <section
          className="home-card"
          style={{
            border: "1px solid rgba(255,215,0,0.35)",
            background:
              "linear-gradient(135deg, rgba(255,215,0,0.22), rgba(255,255,255,0.96))",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* Title */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ✨ Upgrade to Premium
            </div>
            <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.4 }}>
              Unlock the full AI Health Assistant experience and take your
              training to the next level.
            </div>
          </div>

          {/* Benefits */}
          <div
            style={{
              display: "grid",
              gap: 8,
              marginTop: 12,
              marginBottom: 14,
              fontSize: 13,
            }}
          >
            <div className="premium-features-list">
              <div className="feature-item">Unlimited AI Health Consulting</div>
              <div className="feature-item">Advanced Analytics & Insights</div>
              <div className="feature-item">Personalized Training Plans</div>
              <div className="feature-item">Priority Support 24/7</div>
              <div className="feature-item">Ad-free Experience</div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginTop: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 900 }}>
                299.000 VNĐ / Month
              </div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>
                Cancel anytime · Auto-renews monthly
              </div>
            </div>

            <button
              onClick={onUpgrade}
              style={{
                height: 44,
                padding: "0 18px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                fontWeight: 900,
                fontSize: 14,
                background: "linear-gradient(135deg,#ffd700,#ffed4e)",
                boxShadow: "0 6px 16px rgba(255,215,0,0.45)",
              }}
            >
              Upgrade Now
            </button>
          </div>
        </section>
      </div>
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
        title="Quay lại"
      >
        <FiArrowLeft />
      </button>
    </div>
  );
}

const AIChat = () => {
  const navigate = useNavigate();

  // ===== premium state =====
  const [premiumLoading, setPremiumLoading] = useState(true);
  const [myPackage, setMyPackage] = useState(null);

  const isPremium = useMemo(() => isPackageActive(myPackage), [myPackage]);

  // ===== payment modal / QR =====
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const [orderCode, setOrderCode] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [qrError, setQrError] = useState("");

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // ===== chat state =====
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef(null);

  // ===== load package =====
  useEffect(() => {
    const loadMyPackage = async () => {
      setPremiumLoading(true);
      const res = await packageService.getMyPackage();
      setMyPackage(res.success ? res.data : null);
      setPremiumLoading(false);
    };
    loadMyPackage();
  }, []);

  // ===== auto scroll =====
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ===== load messages only if premium =====
  useEffect(() => {
    if (!isPremium) return;

    const loadMessages = async () => {
      try {
        const response = await aiChatService.getMessages();
        if (response.success) setMessages(response.data);
      } catch (err) {
        console.error("Failed to load messages:", err);
        setError("Không thể tải lịch sử chat");
      }
    };

    loadMessages();
  }, [isPremium]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMsg = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiChatService.sendMessage(userMsg);
      if (response.success) {
        setMessages((prev) => [
          ...prev,
          response.data.userMessage,
          response.data.aiMessage,
        ]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Không thể gửi tin nhắn. Vui lòng thử lại.");
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
      console.error("Failed to clear messages:", err);
      setError("Không thể xóa lịch sử chat");
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // ===== create PayOS payment & generate QR when open modal =====
  useEffect(() => {
    const clearTimers = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const createPaymentAndQR = async () => {
      setLoadingQR(true);
      setQrError("");
      setQrUrl(null);
      setOrderCode(null);

      try {
        const newOrderCode =
          (Date.now() % 10_000_000_000_000) +
          Math.floor(Math.random() * 10_000);

        const paymentData = {
          orderCode: newOrderCode,
          amount: 2000,
          description: "Premium 1 month", // <= 25 chars
          returnUrl: window.location.origin + "/payment-success",
          cancelUrl: window.location.origin + "/payment-cancel",
        };

        const result = await PayOSService.createPayment(paymentData);
        setOrderCode(newOrderCode);

        const code =
          result?.qrCode ||
          result?.data?.qrCode ||
          result?.checkoutUrl ||
          result?.data?.checkoutUrl;

        if (typeof code === "string" && code.trim()) {
          const img = code.startsWith("data:image")
            ? code
            : await QRCode.toDataURL(code, { width: 260, margin: 2 });
          setQrUrl(img);
        } else {
          setQrError("Invalid QR data from server.");
        }
      } catch (e) {
        setQrError(e?.message || "Cannot create payment.");
      } finally {
        setLoadingQR(false);
      }
    };

    if (showPaymentModal) createPaymentAndQR();
    else clearTimers();

    return () => clearTimers();
  }, [showPaymentModal]);

  // ===== verify payment once =====
  const verifyOnce = async () => {
    if (!orderCode) return false;

    try {
      const resp = await PayOSService.verifyPayment(orderCode);
      const status = resp?.status || resp?.data?.status;

      if (status === "PAID") {
        // tạo package premium
        const sub = await packageService.subscribePackage();
        if (!sub.success) {
          toast.error(sub.message || "Create package failed");
          return true; // đã paid thì dừng auto-check luôn
        }

        toast.success("Premium activated! Reloading...");
        setShowPaymentModal(false);

        setTimeout(() => {
          window.location.reload();
        }, 2000);

        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  // ===== auto-check: start only after QR rendered; delay 10s then each 5s =====
  useEffect(() => {
    const clearTimers = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    if (!showPaymentModal) {
      clearTimers();
      return;
    }

    const qrReady = !!safeSrc(qrUrl) && !loadingQR && !qrError && !!orderCode;
    if (!qrReady) {
      clearTimers();
      return;
    }

    if (timeoutRef.current || intervalRef.current) return;

    timeoutRef.current = setTimeout(() => {
      verifyOnce();
      intervalRef.current = setInterval(() => {
        verifyOnce();
      }, 5000);
    }, 10000);

    return () => clearTimers();
  }, [showPaymentModal, qrUrl, loadingQR, qrError, orderCode]);

  // ===== UI gating =====
  if (premiumLoading) {
    return (
      <div className="ai-chat-container">
        <div
          className="ai-chat-messages"
          style={{ display: "grid", placeItems: "center" }}
        >
          <div className="text-center py-12 text-black/60">
            <div className="inline-block">
              <div className="animate-spin h-8 w-8 border-4 border-black/20 border-t-black/60 rounded-full"></div>
            </div>
            <p className="mt-2">Checking premium...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <>
        <UpgradePremiumGate onUpgrade={() => setShowPaymentModal(true)} />
        <PaymentQRModal
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          loading={loadingQR}
          error={qrError}
          qrURL={qrUrl}
        />
      </>
    );
  }

  // ===== premium chat UI (original) =====
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
              <div className="example-item">
                • "Làm thế nào để chạy bộ hiệu quả?"
              </div>
              <div className="example-item">
                • "Chế độ ăn cho người tập luyện?"
              </div>
              <div className="example-item">• "Cách phục hồi sau chạy bộ?"</div>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={msg._id || index}
            className={`message ${
              msg.sender === "user" ? "user-message" : "ai-message"
            }`}
          >
            <div className="message-avatar">
              {msg.sender === "user" ? "👤" : "🤖"}
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

      {error && <div className="error-message">⚠️ {error}</div>}

      {showClearConfirm && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2>Xóa lịch sử chat?</h2>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa toàn bộ lịch sử cuộc trò chuyện?</p>
              <p className="modal-warning">
                ⚠️ Hành động này không thể hoàn tác
              </p>
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
          {isLoading ? "..." : "➤"}
        </button>
      </form>
    </div>
  );
};

export default AIChat;
