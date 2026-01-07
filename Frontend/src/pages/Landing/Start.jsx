import React from "react";
import { useNavigate } from "react-router-dom";
import ROUTE_PATH from "../../constants/routePath";
import startImage from "../../image/startImage.png";

export default function Start() {
  const navigate = useNavigate();

  return (
    <div className="startPage">
      <div className="startCard">
        <h1 className="brand">STEPUP</h1>

        <div className="hero" aria-hidden="true">
          <img className="heroImg" src={startImage} alt="Runner illustration" />
        </div>

        <div className="headline">
          GET MOVING AND ACHIVE
          <br />
          YOUR RUNNING GOALS
          <br />
          TODAY!
        </div>

        <div className="actions">
          <button
            className="btn btnPrimary"
            type="button"
            onClick={() => navigate(ROUTE_PATH.SIGNUP)}
          >
            Join now
          </button>

          <button
            className="btn btnGhost"
            type="button"
            onClick={() => navigate(ROUTE_PATH.SIGNIN)}
          >
            Login
          </button>
        </div>
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
  --border: rgba(0,0,0,.55);
}

*{ box-sizing: border-box; }

.startPage{
  min-height: 100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  padding: 24px 16px;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

/* Khung mobile */
.startCard{
  width: min(420px, 100%);
  display:flex;
  flex-direction:column;
  align-items:center;
  text-align:center;
  gap: 18px;
  padding: 8px 6px;
}

/* STEPUP */
.brand{
  margin: 0;
  font-weight: 900;
  letter-spacing: .04em;
  font-size: 44px;
  line-height: 1;
}

/* Ảnh to ở giữa */
.hero{
  width: min(340px, 92vw);
  aspect-ratio: 1 / 1;
  display:flex;
  align-items:center;
  justify-content:center;
}

.heroImg{
  width: 100%;
  height: 100%;
  object-fit: contain;
  display:block;
}

/* Headline to giống hình */
.headline{
  margin-top: 6px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .02em;
  font-size: 34px;
  line-height: 1.05;
}

/* 2 nút */
.actions{
  width: 100%;
  display:flex;
  flex-direction:column;
  gap: 14px;
  margin-top: 6px;
}

.btn{
  width: 100%;
  height: 54px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.btnPrimary{
  background: var(--primary);
  border: 1px solid transparent;
}

.btnPrimary:active{ transform: translateY(1px); }

.btnGhost{
  background: transparent;
  border: 1.6px solid var(--border);
}

.btnGhost:active{ transform: translateY(1px); }

@media (max-width: 380px){
  .brand{ font-size: 40px; }
  .headline{ font-size: 28px; }
  .btn{ height: 52px; }
}

@media (min-width: 768px){
  .startPage{ padding: 48px 20px; }
  .startCard{ width: min(460px, 100%); }
  .hero{ width: min(360px, 92vw); }
  .headline{ font-size: 36px; }
}
`;
