import React from "react";
import { useNavigate } from "react-router-dom";
import { clearOnboardingDraft } from "../../state/onboardingStore";
import ROUTE_PATH from "../../constants/routePath";

export default function OnboardingDone() {
  const navigate = useNavigate();

  const handleDone = () => {
    // clear local onboarding draft (an toàn)
    clearOnboardingDraft();

    // vào Home sau khi onboarding xong
    navigate(ROUTE_PATH.HOME, { replace: true });
  };

  return (
    <div className="page">
      <div className="card">
        <div className="check">✓</div>

        <h1 className="title">
          AWESOME!
          <br />
          YOU’RE ALL SET.
        </h1>

        <div className="sub">
          We've personalized your experience based on your answers. Let's hit
          the ground running and crush your goals!
        </div>

        <button className="btn" type="button" onClick={handleDone}>
          Done
        </button>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
:root{
  --bg: #f3eee4;
  --text: #111;
  --muted: #6b6b6b;
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
  align-items:center;
  text-align:center;
  gap: 12px;
}

.check{
  width: 64px;
  height: 64px;
  border-radius: 999px;
  display:grid;
  place-items:center;
  border: 2px solid rgba(0,0,0,.4);
  font-size: 28px;
}

.title{
  margin: 0;
  font-weight: 900;
  letter-spacing: .02em;
  font-size: 32px;
  line-height: 1.05;
  text-transform: uppercase;
}

.sub{
  color: var(--muted);
  font-size: 12px;
  max-width: 340px;
}

.btn{
  margin-top: 12px;
  width: 100%;
  height: 48px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: var(--primary);
  font-weight: 700;
  cursor:pointer;
}

@media (max-width: 380px){
  .page{ padding: 24px 14px; }
  .title{ font-size: 28px; }
}

@media (min-width: 768px){
  .page{ padding: 48px 20px; }
  .card{ width: min(460px, 100%); }
}
`;
