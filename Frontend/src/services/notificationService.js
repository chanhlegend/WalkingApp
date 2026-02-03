import axios from "axios";

import API_BASE_URL from "../config/api";
import user from "./user";

const API_URL = `${API_BASE_URL}/api/notifications`;

const notificationService = {
  // Create a new notification
  createNotification: async (notificationData) => {
    try {
      const response = await axios.post(API_URL, notificationData, {
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
          error.response?.data?.message || "Failed to create notification",
        success: error.response?.data?.success || false,
      };
    }
  },
  // Get notifications for the logged-in user
  getUserNotifications: async () => {
    try {
      const response = await axios.get(API_URL + "/user", {
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
          error.response?.data?.message || "Failed to retrieve notifications",
        success: error.response?.data?.success || false,
      };
    }
  },
  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/${notificationId}/read`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.getSessionUser().token}`,
          },
        },
      );
      return {
        data: response.data.data,
        message: response.data.message,
        success: response.data.success,
      };
    } catch (error) {
      return {
        message:
          error.response?.data?.message ||
          "Failed to mark notification as read",
        success: error.response?.data?.success || false,
      };
    }
  },

   // ✅ NEW: Mark ALL notifications as read for current user
  markAllAsRead: async () => {
    try {
      const response = await axios.patch(
        `${API_URL}/user/read-all`,
        {},
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
          error.response?.data?.message || "Failed to mark all as read",
        success: error.response?.data?.success || false,
      };
    }
  },
};

export default notificationService;