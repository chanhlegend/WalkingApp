export const baseOnboardingStyles = `
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

  .ob-page{
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    padding: 18px 16px 24px;
    display:flex;
    flex-direction:column;
    justify-content:space-between;
  }

  .ob-top{
    display:flex;
    align-items:center;
    gap: 12px;
  }

  .ob-step{
    font-size: 13px;
    color: var(--muted);
    min-width: 44px;
  }

  .ob-bar{
    flex:1;
    height: 6px;
    background: rgba(0,0,0,.10);
    border-radius: 999px;
    overflow:hidden;
  }

  .ob-bar__fill{
    height: 100%;
    background: rgba(0,0,0,.55);
    width: 0%;
  }

  .ob-content{
    margin-top: 18px;
  }

  .ob-title{
    margin: 10px 0 14px;
    font-weight: 900;
    letter-spacing: .02em;
    font-size: 34px;
    line-height: 1.02;
    text-transform: uppercase;
  }

  .ob-sub{
    margin: 0 0 14px;
    color: var(--muted);
    font-size: 13px;
  }

  .ob-input{
    width: 100%;
    height: 48px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--white);
    padding: 0 12px;
    font-size: 14px;
  }

  .ob-options{ display:flex; flex-direction:column; gap: 10px; }

  .ob-option{
    height: 48px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--white);
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding: 0 12px;
    cursor:pointer;
  }

  .ob-option--selected{
    outline: 2px solid rgba(0,0,0,.5);
    outline-offset: 0px;
  }

  .ob-actions{
    display:flex;
    justify-content:space-between;
    gap: 12px;
    margin-top: 22px;
  }

  .ob-btn{
    height: 42px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid rgba(0,0,0,.55);
    background: transparent;
    font-weight: 700;
    cursor:pointer;
  }

  .ob-btn--primary{
    flex: 1;
    background: var(--primary);
    border-color: transparent;
  }

  .ob-btn:disabled{ opacity: .6; cursor:not-allowed; }
`;

export function Progress({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="ob-top">
      <div className="ob-step">{current}/{total}</div>
      <div className="ob-bar">
        <div className="ob-bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
