import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthService from "../../services/authen";
import { saveOnboardingDraft } from "../../state/onboardingStore";
import ROUTE_PATH from "../../constants/routePath";

export default function OtpVerify() {
  const navigate = useNavigate();
  const location = useLocation();

  const flow = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const f = params.get("flow");
    return f === "login" ? "login" : "signup";
  }, [location.search]);

  const verificationId = useMemo(
    () => sessionStorage.getItem("verificationId") || "",
    []
  );

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const backToEmail = () => {
    navigate(`${ROUTE_PATH.EMAIL}?flow=${flow}`, { replace: true });
  };

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!verificationId) {
      setError("Missing verificationId. Please request OTP again.");
      return;
    }

    if (code.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    setLoading(true);
    try {
      // Expected backend response: { token, user }
      const res = await AuthService.verifyOtp(verificationId, code);
      const token = res?.token;
      const user = res?.user;

      // Fallback persist (in case verifyOtp doesn't store)
      if (token) {
        try {
          localStorage.setItem("token", token);
        } catch (err) {
          void err;
        }
      }
      if (token && user) {
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
          void err;
        }
      }

      // initialize onboarding draft fresh ONLY for signup
      if (flow === "signup") {
        saveOnboardingDraft({
          fullName: "",
          gender: "",
          tall: 0,
          weight: 0,
          experiencePoints: "",
          regularity: "",
          goal: "",
          trainingRunning: "",
        });
      }

      // redirect based on onboarding status (best source is response user)
      if (user?.onboardingCompleted) {
        navigate(ROUTE_PATH.ONBOARDING_DONE, { replace: true });
      } else {
        navigate(ROUTE_PATH.ONBOARDING, { replace: true });
      }
    } catch (err) {
      setError(err?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1 className="title">ENTER OTP</h1>

        <form className="stack" onSubmit={onSubmit}>
          <label className="label">6-digit code</label>
          <input
            className="input"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputMode="numeric"
            pattern="[0-9]{6}"
            placeholder="______"
            autoFocus
            required
          />

          {error ? <div className="error">{error}</div> : null}

          <button className="btn" disabled={loading} type="submit">
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="hint">
          <button className="linkBtn" type="button" onClick={backToEmail}>
            Back to Email
          </button>
        </div>
      </div>

      <style>{baseStyles}</style>
    </div>
  );
}

const baseStyles = `
:root{
  --bg: #f3eee4;
  --text: #111;
  --muted: #6b6b6b;
  --white: #ffffff;
  --border: rgba(0,0,0,.14);
  --primary: #9fe3c9;
}

*{ box-sizing: border-box; }

.page{
  min-height: 100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  padding: 32px 16px;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

.card{
  width: min(420px, 100%);
  display:flex;
  flex-direction:column;
  align-items:stretch;
}

.title{
  margin: 0 0 18px;
  font-weight: 900;
  letter-spacing: .06em;
  font-size: 32px;
  text-align: center;
}

.stack{ display:flex; flex-direction:column; gap: 10px; }

.label{ font-size: 13px; color: var(--muted); font-weight: 700; }

.input{
  height: 54px;
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 0 12px;
  font-size: 22px;
  letter-spacing: .35em;
  text-align: center;
  background: var(--white);
  outline: none;
}

.input:focus{
  border-color: rgba(0,0,0,.28);
}

.btn{
  width: 100%;
  height: 48px;
  background: var(--primary);
  border: 1px solid transparent;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
}

.btn:disabled{ opacity: .7; cursor: not-allowed; }

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
  font-weight: 800;
  border-bottom: 1px solid rgba(0,0,0,.35);
}

.error{
  color: #b00020;
  font-size: 13px;
}

@media (max-width: 380px){
  .page{ padding: 24px 14px; }
  .title{ font-size: 28px; }
  .input{ font-size: 20px; letter-spacing: .28em; }
}

@media (min-width: 768px){
  .page{ padding: 48px 20px; }
  .card{ width: min(460px, 100%); }
}
`;
