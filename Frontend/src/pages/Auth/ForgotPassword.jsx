import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/authen";
import ROUTE_PATH from "../../constants/routePath";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: request otp, 2: reset
  const [email, setEmail] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const passwordCheck = useMemo(() => {
    const value = String(newPassword || "");
    if (value.length < 8) return { ok: false, message: "Mật khẩu phải có ít nhất 8 ký tự" };
    if (value.length > 72) return { ok: false, message: "Mật khẩu tối đa 72 ký tự" };
    if (!/[a-z]/.test(value)) return { ok: false, message: "Mật khẩu cần có chữ thường (a-z)" };
    if (!/[A-Z]/.test(value)) return { ok: false, message: "Mật khẩu cần có chữ hoa (A-Z)" };
    if (!/[0-9]/.test(value)) return { ok: false, message: "Mật khẩu cần có số (0-9)" };
    return { ok: true, message: "" };
  }, [newPassword]);

  async function onRequestOtp(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    setLoading(true);
    try {
      const data = await AuthService.requestPasswordResetOtp(email);
      setVerificationId(data?.verificationId || "");
      setStep(2);
      setInfo("Đã gửi mã OTP. Vui lòng kiểm tra email.");
    } catch (err) {
      setError(err?.message || "Gửi OTP thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function onResetPassword(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!verificationId) {
      setError("Thiếu verificationId. Vui lòng gửi OTP lại.");
      return;
    }

    if (code.length !== 6) {
      setError("OTP phải gồm 6 chữ số");
      return;
    }

    if (!passwordCheck.ok) {
      setError(passwordCheck.message);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPasswordWithOtp(verificationId, code, newPassword);
      setInfo("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      navigate(ROUTE_PATH.SIGNIN, { replace: true });
    } catch (err) {
      setError(err?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1 className="title">FORGOT PASSWORD</h1>

        {step === 1 ? (
          <form className="stack" onSubmit={onRequestOtp}>
            <label className="label">Email</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoComplete="email"
            />

            {error ? <div className="error">{error}</div> : null}
            {info ? <div className="info">{info}</div> : null}

            <button className="btn btn--primary" disabled={loading} type="submit">
              {loading ? "Sending..." : "Send OTP"}
            </button>

            <button
              className="linkBtn"
              type="button"
              onClick={() => navigate(ROUTE_PATH.SIGNIN, { replace: true })}
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form className="stack" onSubmit={onResetPassword}>
            <label className="label">6-digit OTP</label>
            <input
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              pattern="[0-9]{6}"
              placeholder="______"
              required
            />

            <label className="label">New password</label>
            <input
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              required
              autoComplete="new-password"
            />

            <label className="label">Confirm password</label>
            <input
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              required
              autoComplete="new-password"
            />

            <div className="pwHint">Tiêu chuẩn: ≥ 8 ký tự, có chữ hoa, chữ thường và số.</div>

            {error ? <div className="error">{error}</div> : null}
            {info ? <div className="info">{info}</div> : null}

            <button className="btn btn--primary" disabled={loading} type="submit">
              {loading ? "Updating..." : "Update password"}
            </button>

            <button
              className="linkBtn"
              type="button"
              disabled={loading}
              onClick={() => {
                setStep(1);
                setCode("");
                setNewPassword("");
                setConfirmPassword("");
                setError("");
                setInfo("");
              }}
            >
              Resend OTP
            </button>
          </form>
        )}
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
  font-size: 32px;
  text-align: center;
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
.btn--primary{ background: var(--primary); border: 1px solid transparent; }
.linkBtn{
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #111;
  font-weight: 700;
  border-bottom: 1px solid rgba(0,0,0,.35);
  align-self: center;
  margin-top: 6px;
}
.error{ color: #b00020; font-size: 13px; }
.info{ color: #1b5e20; font-size: 13px; }
.pwHint{ color: var(--muted); font-size: 12px; margin-top: -4px; }
`;
