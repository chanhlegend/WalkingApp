const USER_KEY = "user";

function safeJsonParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const UserService = {
  getSessionUser: () => {
    const raw = sessionStorage.getItem(USER_KEY);
    const user = safeJsonParse(raw);
    if (!user || typeof user !== "object") return null;
    return user;
  },

  /** Returns true if session user exists and is not expired (based on expiresAt). */
  isSessionValid: () => {
    const user = UserService.getSessionUser();
    if (!user) return false;

    const expiresAt = Number(user.expiresAt || 0);
    if (!expiresAt) return true; 

    return Date.now() < expiresAt;
  },

  getUserId: () => {
    const user = UserService.getSessionUser();
    if (!user) return "";

    if (typeof user.id === "string" && user.id) return user.id;

    if (typeof user._id === "string" && user._id) return user._id;
    if (typeof user.userId === "string" && user.userId) return user.userId;

    return "";
  },
};

export default UserService;
