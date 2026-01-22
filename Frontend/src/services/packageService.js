import axios from "axios";
import API_BASE_URL from "../config/api";
import user from "./user";

const API_URL = `${API_BASE_URL}/api/packages`;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${user.getSessionUser()?.token}`,
});

const packageService = {
  // GET /api/packages/me  -> lấy gói còn hạn của user hiện tại
  getMyPackage: async () => {
    try {
      const response = await axios.get(`${API_URL}/me`, {
        headers: authHeaders(),
      });

      return {
        data: response.data.package, // ✅ BE trả package
        message: response.data.message,
        success: response.data.success,
      };
    } catch (error) {
      return {
        data: null,
        message:
          error.response?.data?.message || "Failed to retrieve user package",
        success: false,
      };
    }
  },

  // POST /api/packages/subscribe -> tạo package
  // (BE createPackage của bạn hiện không cần packageId, nên không cần truyền)
  subscribePackage: async () => {
    try {
      const response = await axios.post(
        `${API_URL}/subscribe`,
        {}, // ✅ không cần body nếu BE không dùng
        { headers: authHeaders() }
      );

      return {
        data: response.data.package, // ✅ BE trả package
        message: response.data.message,
        success: response.data.success,
      };
    } catch (error) {
      return {
        data: null,
        message: error.response?.data?.message || "Failed to subscribe package",
        success: false,
      };
    }
  },
};

export default packageService;
