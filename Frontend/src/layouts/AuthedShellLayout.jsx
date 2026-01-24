import React, { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    const sync = () => setUser(readSessionUser());
    window.addEventListener("auth:user-updated", sync);
    return () => window.removeEventListener("auth:user-updated", sync);
  }, []);

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

  const displayName = user?.fullName || user?.name || "";
  const avatarUrl = user?.avatarUrl || user?.photo || user?.picture || "";

  const active = useMemo(() => {
    const path = location.pathname;
    if (path === ROUTE_PATH.HOME) return "home";
    if (path === ROUTE_PATH.SETTING_RUNNING) return "settings";
    if (path === ROUTE_PATH.NEW_RUN || path === ROUTE_PATH.OUTDOOR_RUN) return "run";
    if (path === ROUTE_PATH.STATISTICS) return "stats";
    if (path === ROUTE_PATH.AI_CHAT) return "chat";
    return "";
  }, [location.pathname]);

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
              onClick={() => AuthService.logout()}
            >
              Logout
            </button>

            <button className="app-bell" type="button" aria-label="Notifications">
              <FiBell />
              <span className="app-badge" aria-hidden="true">
                1
              </span>
            </button>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>

      <nav className="app-footer" aria-label="Bottom navigation">
        <button
          className={active === "home" ? "app-navBtn app-navBtn--active" : "app-navBtn"}
          type="button"
          aria-label="Home"
          onClick={() => navigate(ROUTE_PATH.HOME)}
        >
          <FiHome />
        </button>

        <button
          className={
            active === "settings" ? "app-navBtn app-navBtn--active" : "app-navBtn"
          }
          type="button"
          aria-label="Settings"
          onClick={() => navigate(ROUTE_PATH.SETTING_RUNNING)}
        >
          <FiSettings />
        </button>

        <button
          className={active === "run" ? "app-navBtn app-navBtn--active" : "app-navBtn"}
          type="button"
          aria-label="Run"
          onClick={() => navigate(ROUTE_PATH.NEW_RUN)}
        >
          <FaPersonRunning />
        </button>

        <button
          className={active === "stats" ? "app-navBtn app-navBtn--active" : "app-navBtn"}
          type="button"
          aria-label="Stats"
          onClick={() => navigate(ROUTE_PATH.STATISTICS)}
        >
          <FiBarChart2 />
        </button>

        <button
          className={active === "chat" ? "app-navBtn app-navBtn--active" : "app-navBtn"}
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
  align-items:center;
  gap: 12px;
  margin-bottom: 14px;
}

.app-topLeft{ display:flex; align-items:center; gap: 10px; }
.app-topRight{ display:flex; align-items:center; gap: 10px; }

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
  width: 18px;
  height: 18px;
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

  touch-action: manipulation; /* ✅ NEW: mobile click */
}

.app-navBtn svg{ width: 20px; height: 20px; }

.app-navBtn--active{
  color: #000;
  background: rgba(255,255,255,.60);
  box-shadow: 0 8px 20px rgba(0,0,0,.08);
  outline: 1px solid rgba(0,0,0,.10);
}

@media (min-width: 768px){
  .app-page{ padding: 28px 20px 40px; }
  .app-shell{ width: min(520px, 100%); }
}
`;