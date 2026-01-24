import React, { useEffect } from "react";
import { FaGoogle, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ROUTE_PATH from "../../constants/routePath";
import AuthService from "../../services/authen";

function ActionButton({ icon, label, onClick }) {
  return (
    <button className="btn" onClick={onClick} type="button">
      <span className="btn__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="btn__text">{label}</span>
    </button>
  );
}

export default function Signup() {
  const navigate = useNavigate();

  const BACKEND_ORIGIN =
    import.meta.env.VITE_BACKEND_ORIGIN || "https://walkingapp.onrender.com";

  
  useEffect(() => {
    (async () => {
      try {
        const me = await AuthService.me(); 
        if (me?.user?.onboardingCompleted) {
          navigate(ROUTE_PATH.ROOT, { replace: true }); 
        }
      } catch {
        // chưa login thì ignore
      }
    })();
  }, [navigate]);

  const handleGoogle = () => {
    AuthService.loginWithGoogle();
  };

  const handleEmail = () => {
    navigate(`${ROUTE_PATH.EMAIL}?flow=signup`);
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    navigate(ROUTE_PATH.SIGNIN);
  };

  return (
    <div className="page">
      <div className="card">
        <h1 className="title">SIGN UP</h1>

        <div className="stack">
          <ActionButton
            icon={<FaGoogle />}
            label="Continue with Google"
            onClick={handleGoogle}
          />
          <ActionButton
            icon={<FaEnvelope />}
            label="Continue with Email"
            onClick={handleEmail}
          />
        </div>

        <div className="hint">
          <span>Already have an account? </span>
          <button className="linkBtn" type="button" onClick={handleSignIn}>
            Sign in
          </button>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
}




const styles = `/* giữ nguyên CSS của bạn */ 
:root{
  --bg: #f3eee4;
  --text: #111;
  --muted: #6b6b6b;
  --white: #ffffff;
  --border: rgba(0,0,0,.14);
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
  align-items:center;
  text-align:center;
}
.title{
  margin: 0 0 18px;
  font-weight: 900;
  letter-spacing: .06em;
  font-size: 38px;
}
.stack{
  width: 100%;
  display:flex;
  flex-direction:column;
  gap: 12px;
  margin-top: 6px;
}
.btn{
  width: 100%;
  height: 52px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
  display:flex;
  align-items:center;
  justify-content:center;
  gap: 10px;
  cursor:pointer;
  transition: transform .08s ease, box-shadow .12s ease;
  box-shadow: 0 1px 0 rgba(0,0,0,.03);
  font-size: 14px;
  font-weight: 650;
}
.btn:hover{
  box-shadow: 0 8px 18px rgba(0,0,0,.08);
}
.btn:active{ transform: translateY(1px); }
.btn__icon{
  width: 22px;
  height: 22px;
  display:grid;
  place-items:center;
  color: #111;
}
.btn__text{ color: #111; }
.hint{
  margin: 14px 0 14px;
  font-size: 13px;
  color: var(--muted);
  display:flex;
  gap: 6px;
  align-items:center;
}
.linkBtn{
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #111;
  font-weight: 800;
  border-bottom: 1px solid rgba(0,0,0,.35);
  line-height: 1.1;
}
.linkBtn:hover{ opacity: .9; }

@media (max-width: 380px){
  .page{ padding: 24px 14px; }
  .title{ font-size: 32px; }
  .btn{ height: 50px; }
}

@media (min-width: 768px){
  .page{ padding: 48px 20px; }
  .card{ width: min(460px, 100%); }
}
`;
