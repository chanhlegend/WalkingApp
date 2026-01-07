import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ROUTE_PATH from "../constants/routePath";

export default function RequireAuthLayout({ children }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    if (!token) {
      navigate(ROUTE_PATH.SIGNUP);
      return;
    }
    setReady(true);
  }, [navigate]);

  if (!ready) return null;
  return <>{children}</>;
}
