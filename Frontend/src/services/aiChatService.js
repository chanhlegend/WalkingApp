import axios from "axios";
import API_BASE_URL from "../config/api";
import user from "./user";

const API_URL = `${API_BASE_URL}/api/ai-chat`;

const aiChatService = {
  // Lấy lịch sử tin nhắn
  getMessages: async () => {
    try {
      const response = await axios.get(`${API_URL}/messages`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.getSessionUser().token}`,
        },
      });
      return {
        data: response.data.data,
        message: response.data.message,
        success: response.data.success,
      };
    } catch (error) {
      return {
        message:
          error.response?.data?.message || "Failed to get AI messages",
        success: error.response?.data?.success || false,
      };
    }
  },

  // Gửi tin nhắn
  sendMessage: async (message) => {
    try {
      const response = await axios.post(
        `${API_URL}/send`,
        { message },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.getSessionUser().token}`,
          },
        }
      );
      return {
        data: response.data.data,
        message: response.data.message,
        success: response.data.success,
      };
    } catch (error) {
      return {
        message:
          error.response?.data?.message || "Failed to send AI message",
        success: error.response?.data?.success || false,
      };
    }
  },

  // Xóa lịch sử chat
  clearMessages: async () => {
    try {
      const response = await axios.delete(`${API_URL}/messages`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.getSessionUser().token}`,
        },
      });
      return {
        data: response.data.data,
        message: response.data.message,
        success: response.data.success,
      };
    } catch (error) {
      return {
        message:
          error.response?.data?.message || "Failed to clear AI messages",
        success: error.response?.data?.success || false,
      };
    }
  }
};

export default aiChatService;
