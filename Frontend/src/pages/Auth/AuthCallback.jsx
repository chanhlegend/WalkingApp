import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/authen";
import ROUTE_PATH from "../../constants/routePath";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          if (!cancelled) setError("Missing token");
          return;
        }

        AuthService.setToken(token);

        const me = await AuthService.me(); // { user }
        const user = me?.user;
        if (!user) throw new Error("Missing user");

        // store session
        try {
          sessionStorage.setItem(
            "user",
            JSON.stringify({
              ...user,
              token,
              expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000,
            })
          );
        } catch (err) {
          console.error("AuthCallback error:", err);
          if (!cancelled) setError(err?.message || "Authentication failed");
        }

        // clean URL
        try {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch (err) {
          void err;
        }

        if (cancelled) return;

        // ✅ YOUR EXPECTATION HERE:
        if (user.onboardingCompleted) {
          navigate(ROUTE_PATH.HOME, { replace: true });
        } else {
          navigate(ROUTE_PATH.ONBOARDING_STEP_1, { replace: true });
          // hoặc ROUTE_PATH.ONBOARDING nếu bạn dùng index route
        }
      } catch (err) {
        void err;
        if (!cancelled) setError("Authentication failed");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div style={{ padding: 24 }}>
      {error ? <div>{error}</div> : <div>Signing you in...</div>}
    </div>
  );
}
