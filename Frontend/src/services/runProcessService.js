import axios from "axios";
import API_BASE_URL from "../config/api";
import user from "./user";

const API_URL = `${API_BASE_URL}/api/run-processes`;

const runProcessService = {
  // Tạo một RunProcess mới
  createRunProcess: async (runProcessData) => {
    console.log(runProcessData);

    try {
      const response = await axios.post(API_URL, runProcessData, {
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
          error.response?.data?.message || "Failed to create run process",
        success: error.response?.data?.success || false,
      };
    }
  },

  // Lấy các RunProcess theo ngày
  getRunProcessesByDate: async (date) => {
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
        message:
          error.response?.data?.message ||
          "Failed to retrieve run processes by date",
        success: error.response?.data?.success || false,
      };
    }
  },

  // Lấy thống kê overview theo period
  getStatsOverview: async (period = "week") => {
    try {
      const response = await axios.get(`${API_URL}/stats/overview`, {
        params: { period },
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
          error.response?.data?.message ||
          "Failed to retrieve stats overview",
        success: error.response?.data?.success || false,
      };
    }
  },
};

export default runProcessService;
