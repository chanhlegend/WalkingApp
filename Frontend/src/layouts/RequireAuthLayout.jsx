import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ROUTE_PATH from "../constants/routePath";
import AuthService from "../services/authen";

export default function RequireAuthLayout({ children }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = localStorage.getItem("token") || "";
      if (!token) {
        navigate(ROUTE_PATH.SIGNUP);
        return;
      }

      try {
        await AuthService.ensureSessionUser();
      } catch {
        // ignore
      }

      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (!ready) return null;
  return <>{children}</>;
}
