import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiBell,
  FiHome,
  FiMessageCircle,
  FiSettings,
} from "react-icons/fi";
import { FaPersonRunning } from "react-icons/fa6";

import ROUTE_PATH from "../constants/routePath";
import AuthService from "../services/authen";
import notificationService from "../services/notificationService";
import { connectSocket, disconnectSocket } from "../services/socketClient";

function readSessionUser() {
  try {
    const raw = sessionStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function AuthedShellLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState(() => readSessionUser());

  const [notifications, setNotifications] = useState([]);
  const [openNoti, setOpenNoti] = useState(false);

  const bellBtnRef = useRef(null);
  const notiPanelRef = useRef(null);

  // Sync session user when updated elsewhere
  useEffect(() => {
    const sync = () => setUser(readSessionUser());
    window.addEventListener("auth:user-updated", sync);
    return () => window.removeEventListener("auth:user-updated", sync);
  }, []);

  // Auth check
  useEffect(() => {
    let cancelled = false;

    (async () => {
      let token = "";
      try {
        token = localStorage.getItem("token") || "";
      } catch {
        token = "";
      }

      const authed = Boolean(token);
      if (!cancelled) {
        setIsAuthed(authed);
        setAuthChecked(true);
      }

      if (!authed) {
        navigate(ROUTE_PATH.SIGNUP, { replace: true });
        return;
      }

      try {
        const ensured = await AuthService.ensureSessionUser();
        if (!cancelled && ensured) setUser(ensured);
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Fetch notifications when authed
  useEffect(() => {
    const fetchNotifications = async () => {
      const result = await notificationService.getUserNotifications();
      if (result.success) {
        setNotifications(result.data || []);
      }
    };

    if (isAuthed) {
      fetchNotifications();
    }
  }, [isAuthed]);

  useEffect(() => {
    if (!isAuthed) return;

    // lấy userId từ session user của bạn
    const userId = user?._id || user?.id;
    if (!userId) return;

    const s = connectSocket();

    // join room theo userId (BE đang yêu cầu join)
    s.emit("join", { userId });

    const onNewNoti = (newNoti) => {
      // add lên đầu list (mới nhất)
      setNotifications((prev) => [newNoti, ...prev]);
    };

    s.on("notification:new", onNewNoti);

    // ✅ optional: đồng bộ read-all giữa nhiều thiết bị
    const onReadAll = () => {
      setNotifications((prev) =>
        prev.map((n) => (n.isRead ? n : { ...n, isRead: true })),
      );
    };
    s.on("notification:read-all", onReadAll);

    return () => {
      s.off("notification:new", onNewNoti);
      s.off("notification:read-all", onReadAll);
      // nếu muốn disconnect khi logout/unmount:
      // disconnectSocket();
    };
  }, [isAuthed, user]);

  // Close notification panel when click outside
  useEffect(() => {
    if (!openNoti) return;

    const handleClickOutside = (e) => {
      const panel = notiPanelRef.current;
      const bell = bellBtnRef.current;

      if (panel && panel.contains(e.target)) return;
      if (bell && bell.contains(e.target)) return;

      setOpenNoti(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openNoti]);

  const displayName = user?.fullName || user?.name || "";
  const avatarUrl = user?.avatarUrl || user?.photo || user?.picture || "";

  const active = useMemo(() => {
    const path = location.pathname;
    if (path === ROUTE_PATH.HOME) return "home";
    if (path === ROUTE_PATH.SETTING_RUNNING) return "settings";
    if (path === ROUTE_PATH.NEW_RUN || path === ROUTE_PATH.OUTDOOR_RUN)
      return "run";
    if (path === ROUTE_PATH.STATISTICS) return "stats";
    if (path === ROUTE_PATH.AI_CHAT) return "chat";
    return "";
  }, [location.pathname]);

  const unreadCount = useMemo(() => {
    return notifications.reduce((acc, n) => acc + (n?.isRead ? 0 : 1), 0);
  }, [notifications]);

  const handleToggleNotifications = async () => {
    const nextOpen = !openNoti;
    setOpenNoti(nextOpen);

    // When opening panel => mark all unread as read
    if (nextOpen && unreadCount > 0) {
      // Optimistic UI: update immediately
      setNotifications((prev) =>
        prev.map((n) =>
          n?.isRead
            ? n
            : { ...n, isRead: true, readAt: new Date().toISOString() },
        ),
      );

      // Call backend to persist
      try {
        const r = await notificationService.markAllAsRead();
        if (r?.success) {
          setNotifications(r.data || []);
        } else {
          // fallback refetch to keep UI consistent
          const refetch = await notificationService.getUserNotifications();
          if (refetch.success) setNotifications(refetch.data || []);
        }
      } catch {
        const refetch = await notificationService.getUserNotifications();
        if (refetch.success) setNotifications(refetch.data || []);
      }
    }
  };

  if (!authChecked || !isAuthed) {
    return (
      <div className="app-page">
        <div className="app-shell">
          <div
            style={{
              padding: 18,
              textAlign: "center",
              color: "rgba(0,0,0,.65)",
              fontWeight: 700,
            }}
          >
            Loading…
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="app-shell">
        <header className="app-top">
          <div className="app-topLeft">
            <div className="app-avatar" aria-hidden="true">
              {avatarUrl ? (
                <img className="app-avatarImg" src={avatarUrl} alt="" />
              ) : (
                <div className="app-avatarFallback" />
              )}
            </div>
            <div className="app-greet">
              <div className="app-greetText">
                Good morning{displayName ? ", " : ""}
                <span className="app-greetName">{displayName}</span>
              </div>
            </div>
          </div>

          <div className="app-topRight">
            <button
              className="app-logout"
              type="button"
              onClick={() => {
                disconnectSocket();
                AuthService.logout();
              }}
            >
              Logout
            </button>

            <button
              ref={bellBtnRef}
              className="app-bell"
              type="button"
              aria-label="Notifications"
              onClick={handleToggleNotifications}
            >
              <FiBell />
              {unreadCount > 0 && (
                <span className="app-badge" aria-hidden="true">
                  {unreadCount}
                </span>
              )}
            </button>

            {openNoti && (
              <div
                ref={notiPanelRef}
                className="app-notiPanel"
                role="dialog"
                aria-label="Notifications list"
              >
                <div className="app-notiHeader">
                  <div className="app-notiTitle">Notifications</div>
                  <button
                    className="app-notiClose"
                    type="button"
                    onClick={() => setOpenNoti(false)}
                    aria-label="Close notifications"
                  >
                    ✕
                  </button>
                </div>

                <div className="app-notiList">
                  {notifications.length === 0 ? (
                    <div className="app-notiEmpty">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={
                          n.isRead
                            ? "app-notiItem"
                            : "app-notiItem app-notiItem--unread"
                        }
                      >
                        <div className="app-notiItemTop">
                          <div className="app-notiItemTitle">{n.title}</div>
                          <div
                            className={"app-notiType app-notiType--" + n.type}
                          >
                            {n.type}
                          </div>
                        </div>

                        <div className="app-notiMsg">{n.message}</div>

                        <div className="app-notiTime">
                          {n.sentAt ? new Date(n.sentAt).toLocaleString() : ""}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>

      <nav className="app-footer" aria-label="Bottom navigation">
        <button
          className={
            active === "home" ? "app-navBtn app-navBtn--active" : "app-navBtn"
          }
          type="button"
          aria-label="Home"
          onClick={() => navigate(ROUTE_PATH.HOME)}
        >
          <FiHome />
        </button>

        <button
          className={
            active === "settings"
              ? "app-navBtn app-navBtn--active"
              : "app-navBtn"
          }
          type="button"
          aria-label="Settings"
          onClick={() => navigate(ROUTE_PATH.SETTING_RUNNING)}
        >
          <FiSettings />
        </button>

        <button
          className={
            active === "run" ? "app-navBtn app-navBtn--active" : "app-navBtn"
          }
          type="button"
          aria-label="Run"
          onClick={() => navigate(ROUTE_PATH.NEW_RUN)}
        >
          <FaPersonRunning />
        </button>

        <button
          className={
            active === "stats" ? "app-navBtn app-navBtn--active" : "app-navBtn"
          }
          type="button"
          aria-label="Stats"
          onClick={() => navigate(ROUTE_PATH.STATISTICS)}
        >
          <FiBarChart2 />
        </button>

        <button
          className={
            active === "chat" ? "app-navBtn app-navBtn--active" : "app-navBtn"
          }
          type="button"
          aria-label="Chat"
          onClick={() => navigate(ROUTE_PATH.AI_CHAT)}
        >
          <FiMessageCircle />
        </button>
      </nav>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
:root{
  --bg: #f3eee4;
  --text: #111;
  --muted: #6b6b6b;
  --white: #ffffff;
  --border: rgba(0,0,0,.12);
  --primary: #A7E6CF;
  --footer-h: 64px;
}

*{ box-sizing: border-box; }
body{ margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }

.app-page{
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  padding: 18px 14px 28px;
  padding-left: max(14px, env(safe-area-inset-left));
  padding-right: max(14px, env(safe-area-inset-right));
  padding-bottom: calc(max(28px, env(safe-area-inset-bottom)) + var(--footer-h));
  display:flex;
  justify-content:center;
  position: relative;
  z-index: 0;
}

.app-shell{
  width: min(420px, 100%);
  position: relative;
  z-index: 1;
}

.app-top{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.app-topLeft{ display:flex; align-items:center; gap: 10px; }
.app-topRight{
  display:flex;
  align-items:center;
  gap: 10px;
  position: relative; /* ✅ for notification panel absolute positioning */
}

.app-avatar{
  width: clamp(36px, 10vw, 44px);
  height: clamp(36px, 10vw, 44px);
  border-radius: 50%;
  overflow:hidden;
  border: 1px solid rgba(0,0,0,.14);
  background: rgba(255,255,255,.65);
  flex: 0 0 auto;
}

.app-avatarImg{ width: 100%; height: 100%; object-fit: cover; display:block; border-radius: inherit; }
.app-avatarFallback{ width: 100%; height: 100%; background: rgba(0,0,0,.08); }

.app-greetText{ font-weight: 500; font-size: 16px; }
.app-greetName{ font-weight: 800; }

.app-bell{
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,.14);
  background: rgba(255,255,255,.7);
  display:grid;
  place-items:center;
  cursor:pointer;
}

.app-bell svg{ width: 20px; height: 20px; }

.app-badge{
  position:absolute;
  top: 7px;
  right: 7px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #e53935;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  display:grid;
  place-items:center;
  border: 2px solid rgba(255,255,255,.95);
}

.app-logout{
  height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,.14);
  background: rgba(255,255,255,.7);
  cursor:pointer;
  font-weight: 700;
  font-size: 13px;
}

/* ✅ FIX CLICK: add z-index + pointer-events */
.app-footer{
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--footer-h);
  display:flex;
  align-items:center;
  justify-content:center;
  padding: 0 max(14px, env(safe-area-inset-left)) env(safe-area-inset-bottom) max(14px, env(safe-area-inset-right));
  background: var(--primary);

  z-index: 9999;
  pointer-events: auto;
}

.app-footer::before{
  content:"";
  position:absolute;
  inset: 0;
  border-top: 1px solid rgba(0,0,0,.10);
  pointer-events:none;
}

.app-footer > *{ position: relative; }
.app-footer{ gap: 22px; }

.app-navBtn{
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 0;
  background: transparent;
  color: rgba(0,0,0,.75);
  display:grid;
  place-items:center;
  cursor:pointer;
  touch-action: manipulation;
}

.app-navBtn svg{ width: 20px; height: 20px; }

.app-navBtn--active{
  color: #000;
  background: rgba(255,255,255,.60);
  box-shadow: 0 8px 20px rgba(0,0,0,.08);
  outline: 1px solid rgba(0,0,0,.10);
}

/* =======================
   Notifications Panel
   ======================= */
.app-notiPanel{
  position: absolute;
  top: 54px;
  right: 0;
  width: min(360px, 92vw);
  max-height: 60vh;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid rgba(0,0,0,.12);
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 40px rgba(0,0,0,.14);
  z-index: 10000;
}

.app-notiHeader{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(0,0,0,.08);
}

.app-notiTitle{ font-weight: 900; }
.app-notiClose{
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  padding: 4px 6px;
}

.app-notiList{
  padding: 10px;
  overflow: auto;
  max-height: calc(60vh - 44px);
}

.app-notiEmpty{
  color: rgba(0,0,0,.55);
  padding: 14px;
  text-align:center;
  font-weight: 600;
}

.app-notiItem{
  padding: 10px 10px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,.08);
  background: rgba(255,255,255,.7);
  margin-bottom: 10px;
}

.app-notiItem--unread{
  outline: 2px solid rgba(0,0,0,.08);
  background: rgba(167,230,207,.35);
}

.app-notiItemTop{
  display:flex;
  gap: 10px;
  align-items:center;
  justify-content:space-between;
}

.app-notiItemTitle{ font-weight: 900; font-size: 14px; }
.app-notiMsg{ margin-top: 4px; color: rgba(0,0,0,.75); font-size: 13px; }
.app-notiTime{ margin-top: 6px; color: rgba(0,0,0,.5); font-size: 12px; }

.app-notiType{
  font-size: 11px;
  font-weight: 900;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,.10);
  text-transform: capitalize;
  flex: 0 0 auto;
}
.app-notiType--info{ background: rgba(30,136,229,.12); }
.app-notiType--success{ background: rgba(67,160,71,.14); }
.app-notiType--warning{ background: rgba(251,140,0,.16); }
.app-notiType--error{ background: rgba(229,57,53,.14); }

@media (min-width: 768px){
  .app-page{ padding: 28px 20px 40px; }
  .app-shell{ width: min(520px, 100%); }
}
`;
