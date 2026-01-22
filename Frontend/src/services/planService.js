import axios from "axios";
import API_BASE_URL from "../config/api";
import user from "./user";

const API_URL = `${API_BASE_URL}/api/plans`;

const planService = {
  upsertGoalSettings: async (goalData) => {
      console.log("Token", user.getSessionUser().token);
    try {
        
      const response = await axios.post(`${API_URL}/goal-settings`, goalData, {
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
          error.response?.data?.message || "Failed to save goal settings",
        success: error.response?.data?.success || false,
      };
    }
  },

  getPlansByDate: async (date) => {
    try {
      const response = await axios.get(`${API_URL}/by-date`, {
        params: { date },
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
        message: error.response?.data?.message || "Failed to retrieve plans by date",
        success: error.response?.data?.success || false,
      };
    }
  },

  // giữ lại nếu bạn đang dùng các hàm cũ
  createPlan: async (planData) => {
    try {
      const response = await axios.post(API_URL, planData, {
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
        message: error.response?.data?.message || "Failed to create plan",
        success: error.response?.data?.success || false,
      };
    }
  },

  getPlans: async () => {
    try {
      const response = await axios.get(API_URL, {
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
        message: error.response?.data?.message || "Failed to retrieve plans",
        success: error.response?.data?.success || false,
      };
    }
  },

  updatePlan: async (id, updateData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, updateData, {
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
        message: error.response?.data?.message || "Failed to update plan",
        success: error.response?.data?.success || false,
      };
    }
  },

  deletePlan: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.getSessionUser().token}`,
        },
      });
      return {
        message: response.data.message,
        success: response.data.success,
      };
    } catch (error) {
      return {
        message: error.response?.data?.message || "Failed to delete plan",
        success: error.response?.data?.success || false,
      };
    }
  },
};

export default planService;
