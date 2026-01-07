import axios from "axios";
import ROUTE_PATH from "../constants/routePath";

const API_BASE = "http://localhost:3000/api"; 
const TOKEN_KEY = "token";
const USER_KEY = "user";

const http = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

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
}

function updateStoredUser(patch) {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    const current = raw ? JSON.parse(raw) : {};
    sessionStorage.setItem(
      USER_KEY,
      JSON.stringify({ ...current, ...(patch || {}), token: getStoredToken() })
    );
  } catch {
    // ignore
  }
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
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

  me: async () => {
    try {
      const res = await http.get("/me");
      return res.data; // { user }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Không lấy được thông tin user");
    }
  },

  requestOtp: async (email, password, flow = "signup") => {
    try {
      const res = await http.post("/auth/email/request-otp", { flow, email, password });
      return res.data; // { verificationId, expiresAt }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Gửi OTP thất bại");
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
