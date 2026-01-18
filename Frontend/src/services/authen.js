import axios from "axios";
import ROUTE_PATH from "../constants/routePath";
import API_BASE_URL from "../config/api";


// const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:3000";
const API_BASE = `${API_BASE_URL}/api`;
const TOKEN_KEY = "token";
const USER_KEY = "user";

const http = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

function emitUserUpdated() {
  try {
    window.dispatchEvent(new Event("auth:user-updated"));
  } catch {
    // ignore
  }
}

function getStoredToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) return token;

  try {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return "";
    const user = JSON.parse(raw);
    return user?.token || "";
  } catch {
    return "";
  }
}

function saveSession({ token, user, expiresInMs = 14 * 24 * 60 * 60 * 1000 }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(
    USER_KEY,
    JSON.stringify({ ...(user || {}), token, expiresAt: Date.now() + expiresInMs })
  );
  emitUserUpdated();
}

function updateStoredUser(patch) {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    const current = raw ? JSON.parse(raw) : {};
    sessionStorage.setItem(
      USER_KEY,
      JSON.stringify({ ...current, ...(patch || {}), token: getStoredToken() })
    );
    emitUserUpdated();
  } catch {
    // ignore
  }
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  emitUserUpdated();
}

// auto attach Bearer token
http.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthService = {
  setToken: (token) => {
    if (!token) return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  loginEmail: async (email, password) => {
    try {
      const res = await http.post("/auth/email/login", { email, password });
      const { token, user } = res.data || {};
      if (!token || !user) throw new Error("Dữ liệu trả về không hợp lệ");

      saveSession({ token, user });
      return res.data; // { token, user }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
    }
  },

  me: async () => {
    try {
      const res = await http.get("/me");
      return res.data; // { user }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Không lấy được thông tin user");
    }
  },

  /**
   * If a token exists but session user is missing (or stale), fetches /me and
   * repopulates sessionStorage so layouts can show avatar/name.
   */
  ensureSessionUser: async () => {
    const token = getStoredToken();
    if (!token) return null;

    try {
      const raw = sessionStorage.getItem(USER_KEY);
      if (raw) {
        const existing = JSON.parse(raw);
        if (existing && typeof existing === "object") return existing;
      }
    } catch {
      // ignore
    }

    const me = await AuthService.me();
    const user = me?.user;
    if (user) saveSession({ token, user });
    return user || null;
  },

  requestOtp: async (email, password, flow = "signup") => {
    try {
      const res = await http.post("/auth/email/request-otp", { flow, email, password });
      return res.data; // { verificationId, expiresAt }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Gửi OTP thất bại");
    }
  },

  requestPasswordResetOtp: async (email) => {
    try {
      const res = await http.post("/auth/email/forgot-password", { email });
      return res.data; // { verificationId, expiresAt }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Gửi OTP thất bại");
    }
  },

  resetPasswordWithOtp: async (verificationId, code, newPassword) => {
    try {
      const res = await http.post("/auth/email/reset-password", {
        verificationId,
        code,
        newPassword,
      });
      return res.data; // { message }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  },

  verifyOtp: async (verificationId, code) => {
    try {
      const res = await http.post("/auth/email/verify-otp", { verificationId, code });
      const { token, user } = res.data || {};
      if (!token || !user) throw new Error("Dữ liệu trả về không hợp lệ");

      saveSession({ token, user });
      return res.data; // { token, user }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Xác thực OTP thất bại");
    }
  },

  loginWithGoogle: () => {
    window.location.href = `${API_BASE}/auth/google`;
  },

  submitOnboarding: async (payload) => {
    try {
      const res = await http.put("/me/onboarding", payload);
      const user = res.data?.user;
      if (!user) throw new Error("Dữ liệu trả về không hợp lệ từ server");
      updateStoredUser(user);
      return res.data; // { user }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Lưu onboarding thất bại");
    }
  },

  logout: () => {
    clearSession();
    window.location.href = ROUTE_PATH.ROOT;
  },
};

export default AuthService;
