import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthService from "../../services/authen";
import ROUTE_PATH from "../../constants/routePath";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function EmailAuth() {
  const navigate = useNavigate();
  const loc = useLocation();
  const q = useQuery();

  const flow = (q.get("flow") || (loc.pathname === "/signin" ? "login" : "signup")).toLowerCase();
  const isLogin = flow === "login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  const passwordCheck = useMemo(() => {
    if (isLogin) return { ok: true, message: "" };
    const value = String(password || "");
    if (value.length < 8) return { ok: false, message: "Mật khẩu phải có ít nhất 8 ký tự" };
    if (value.length > 72) return { ok: false, message: "Mật khẩu tối đa 72 ký tự" };
    if (!/[a-z]/.test(value)) return { ok: false, message: "Mật khẩu cần có chữ thường (a-z)" };
    if (!/[A-Z]/.test(value)) return { ok: false, message: "Mật khẩu cần có chữ hoa (A-Z)" };
    if (!/[0-9]/.test(value)) return { ok: false, message: "Mật khẩu cần có số (0-9)" };
    return { ok: true, message: "" };
  }, [isLogin, password]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await AuthService.me(); // { user }
        if (cancelled) return;

        if (me?.user?.onboardingCompleted) {
          navigate(ROUTE_PATH.ROOT, { replace: true }); // HOME
          return;
        }
        // nếu chưa onboarding thì đưa thẳng onboarding
        if (me?.user && !me.user.onboardingCompleted) {
          navigate(ROUTE_PATH.ONBOARDING, { replace: true });
          return;
        }
      } catch {
        // not logged in -> stay on this page
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!passwordCheck.ok) {
      setError(passwordCheck.message);
      return;
    }

    setLoading(true);
    try {
      const data = await AuthService.requestOtp(email, password, isLogin ? "login" : "signup");
      sessionStorage.setItem("verificationId", data.verificationId);
      navigate(ROUTE_PATH.OTP);
    } catch (err) {
      setError(err?.message || "Failed to request OTP");
    } finally {
      setLoading(false);
    }
  }

  const onGoogle = () => {
    AuthService.loginWithGoogle();
  };

  if (checking) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  return (
    <div className="page">
      <div className="card">
        <h1 className="title">{isLogin ? "SIGN IN" : "SIGN UP"}</h1>

        <button className="btn btn--google" type="button" onClick={onGoogle} disabled={loading}>
          <span className="gIcon" aria-hidden="true">G</span>
          Continue with Google
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <form className="stack" onSubmit={onSubmit}>
          <label className="label">Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            autoComplete="email"
          />

          <label className="label">Password</label>
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
          />

          {!isLogin ? (
            <div className="pwHint">
              Tiêu chuẩn: ≥ 8 ký tự, có chữ hoa, chữ thường và số.
            </div>
          ) : null}

          {error ? <div className="error">{error}</div> : null}

          <button className="btn btn--primary" disabled={loading || (!isLogin && !passwordCheck.ok)} type="submit">
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <div className="hint">
          {isLogin ? (
            <>
              <span>Don’t have an account? </span>
              <button
                className="linkBtn"
                type="button"
                onClick={() => navigate(`${ROUTE_PATH.EMAIL}?flow=signup`, { replace: true })}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              <span>Already have an account? </span>
              <button
                className="linkBtn"
                type="button"
                onClick={() => navigate(ROUTE_PATH.SIGNIN, { replace: true })}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>

      <style>{baseStyles}</style>
    </div>
  );
}

const baseStyles = `/* giữ nguyên CSS bạn đang dùng */ 
:root{
  --bg: #f3eee4;
  --text: #111;
  --muted: #6b6b6b;
  --white: #ffffff;
  --border: rgba(0,0,0,.14);
  --primary: #9fe3c9;
}
*{ box-sizing: border-box; }
body{ margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
.page{
  min-height: 100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  padding: 32px 16px;
  background: var(--bg);
  color: var(--text);
}
.card{
  width: min(420px, 100%);
  display:flex;
  flex-direction:column;
  align-items:stretch;
}
.title{
  margin: 0 0 18px;
  font-weight: 800;
  letter-spacing: .06em;
  font-size: 36px;
  text-align: center;
}
.btn{
  width: 100%;
  height: 48px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--white);
  display:flex;
  align-items:center;
  justify-content:center;
  gap: 10px;
}
.btn:disabled{ opacity: .7; cursor: not-allowed; }
.btn--google{ margin-bottom: 10px; }
.gIcon{
  width: 22px;
  height: 22px;
  display:grid;
  place-items:center;
  border-radius: 6px;
  font-weight: 900;
}
.divider{
  position: relative;
  display:flex;
  justify-content:center;
  margin: 8px 0 12px;
  color: var(--muted);
  font-size: 12px;
}
.divider::before{
  content:"";
  position:absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(0,0,0,.12);
}
.divider span{
  position: relative;
  background: var(--bg);
  padding: 0 10px;
}
.stack{ display:flex; flex-direction:column; gap: 10px; }
.label{ font-size: 13px; color: var(--muted); font-weight: 600; }
.input{
  height: 48px;
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 0 12px;
  font-size: 14px;
  background: var(--white);
}
.btn--primary{
  background: var(--primary);
  border: 1px solid transparent;
}
.hint{
  margin-top: 14px;
  font-size: 13px;
  color: var(--muted);
  text-align:center;
}
.linkBtn{
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #111;
  font-weight: 700;
  border-bottom: 1px solid rgba(0,0,0,.35);
}
.error{ color: #b00020; font-size: 13px; }
.pwHint{ color: var(--muted); font-size: 12px; margin-top: -4px; }

@media (max-width: 380px){
  .page{ padding: 24px 14px; }
  .title{ font-size: 30px; }
  .btn{ height: 46px; }
}

@media (min-width: 768px){
  .page{ padding: 48px 20px; }
  .card{ width: min(460px, 100%); }
}
`;
