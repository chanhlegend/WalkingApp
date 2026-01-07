import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/authen";
import { clearOnboardingDraft, loadOnboardingDraft, saveOnboardingDraft } from "../../state/onboardingStore";
import ROUTE_PATH from "../../constants/routePath";

const defaultDraft = {
  fullName: "",
  gender: "", // 'male' | 'female' | 'other' | ''
  tall: "", // cm
  weight: "", // kg
  experiencePoints: "",
  regularity: "",
  goal: "",
  trainingRunning: "",
};

export default function Onboarding() {
  const navigate = useNavigate();

  const initial = useMemo(() => loadOnboardingDraft() || defaultDraft, []);
  const [draft, setDraft] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Require auth
    const token = localStorage.getItem("token") || "";
    if (!token) navigate(ROUTE_PATH.SIGNUP);
  }, [navigate]);

  useEffect(() => {
    saveOnboardingDraft(draft);
  }, [draft]);

  function setField(key, value) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        fullName: String(draft.fullName || "").trim(),
        gender: draft.gender || undefined,
        tall: draft.tall ? Number(draft.tall) : undefined,
        weight: draft.weight ? Number(draft.weight) : undefined,
        experiencePoints: draft.experiencePoints || undefined,
        regularity: draft.regularity || undefined,
        goal: draft.goal || undefined,
        trainingRunning: draft.trainingRunning || undefined,
      };

      await AuthService.submitOnboarding(payload);
      clearOnboardingDraft();
      navigate(ROUTE_PATH.HOME);
    } catch (err) {
      setError(err?.message || "Failed to save onboarding");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1 className="title">LET’S SET YOU UP</h1>
        <div className="sub">Fill in your details. We’ll save when you press Next.</div>

        <form className="form" onSubmit={onSubmit}>
          <div className="section">
            <div className="section__title">What’s your full name?</div>
            <input
              className="input"
              value={draft.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              placeholder="Full name"
              required
            />
          </div>

          <div className="section">
            <div className="section__title">What’s your gender?</div>
            <div className="options">
              <Option
                label="Man"
                checked={draft.gender === "male"}
                onClick={() => setField("gender", "male")}
              />
              <Option
                label="Woman"
                checked={draft.gender === "female"}
                onClick={() => setField("gender", "female")}
              />
              <Option
                label="Other"
                checked={draft.gender === "other"}
                onClick={() => setField("gender", "other")}
              />
              <Option
                label="I don’t want to answer"
                checked={draft.gender === ""}
                onClick={() => setField("gender", "")}
              />
            </div>
          </div>

          <div className="section">
            <div className="section__title">Height (cm)</div>
            <input
              className="input"
              value={draft.tall}
              onChange={(e) => setField("tall", e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              placeholder="e.g. 180"
            />
          </div>

          <div className="section">
            <div className="section__title">Weight (kg)</div>
            <input
              className="input"
              value={draft.weight}
              onChange={(e) => setField("weight", e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              placeholder="e.g. 80"
            />
          </div>

          <div className="section">
            <div className="section__title">What’s your running experience?</div>
            <div className="options">
              <Option
                label="Beginner (Just starting out)"
                checked={draft.experiencePoints === "Beginner"}
                onClick={() => setField("experiencePoints", "Beginner")}
              />
              <Option
                label="Intermediate (Run occasionally)"
                checked={draft.experiencePoints === "Intermediate"}
                onClick={() => setField("experiencePoints", "Intermediate")}
              />
              <Option
                label="Advanced (Run regularly)"
                checked={draft.experiencePoints === "Advanced"}
                onClick={() => setField("experiencePoints", "Advanced")}
              />
            </div>
          </div>

          <div className="section">
            <div className="section__title">How often do you run?</div>
            <div className="options">
              <Option
                label="1-2 times"
                checked={draft.regularity === "1-2 times"}
                onClick={() => setField("regularity", "1-2 times")}
              />
              <Option
                label="3-4 times"
                checked={draft.regularity === "3-4 times"}
                onClick={() => setField("regularity", "3-4 times")}
              />
              <Option
                label="5+ times"
                checked={draft.regularity === "5+ times"}
                onClick={() => setField("regularity", "5+ times")}
              />
              <Option
                label="I don’t run yet but I want to start"
                checked={draft.regularity === "I don’t run yet but I want to start"}
                onClick={() => setField("regularity", "I don’t run yet but I want to start")}
              />
            </div>
          </div>

          <div className="section">
            <div className="section__title">What’s your running goal?</div>
            <div className="options">
              <Option
                label="Improve endurance"
                checked={draft.goal === "Improve endurance"}
                onClick={() => setField("goal", "Improve endurance")}
              />
              <Option
                label="Increase speed"
                checked={draft.goal === "Increase speed"}
                onClick={() => setField("goal", "Increase speed")}
              />
              <Option
                label="Lose weight"
                checked={draft.goal === "Lose weight"}
                onClick={() => setField("goal", "Lose weight")}
              />
              <Option
                label="Stay fit & healthy"
                checked={draft.goal === "Stay fit & healthy"}
                onClick={() => setField("goal", "Stay fit & healthy")}
              />
              <Option
                label="Just for fun"
                checked={draft.goal === "Just for fun"}
                onClick={() => setField("goal", "Just for fun")}
              />
            </div>
          </div>

          <div className="section">
            <div className="section__title">Are you training for a specific event?</div>
            <div className="options">
              <Option
                label="5K race"
                checked={draft.trainingRunning === "5K race"}
                onClick={() => setField("trainingRunning", "5K race")}
              />
              <Option
                label="10K race"
                checked={draft.trainingRunning === "10K race"}
                onClick={() => setField("trainingRunning", "10K race")}
              />
              <Option
                label="Half marathon"
                checked={draft.trainingRunning === "Half marathon"}
                onClick={() => setField("trainingRunning", "Half marathon")}
              />
              <Option
                label="Full marathon"
                checked={draft.trainingRunning === "Full marathon"}
                onClick={() => setField("trainingRunning", "Full marathon")}
              />
              <Option
                label="Triathlon"
                checked={draft.trainingRunning === "Triathlon"}
                onClick={() => setField("trainingRunning", "Triathlon")}
              />
              <Option
                label="General fitness & wellness"
                checked={draft.trainingRunning === "General fitness & wellness"}
                onClick={() => setField("trainingRunning", "General fitness & wellness")}
              />
              <Option
                label="Not training for an event"
                checked={draft.trainingRunning === "Not training for an event"}
                onClick={() => setField("trainingRunning", "Not training for an event")}
              />
            </div>
          </div>

          {error ? <div className="error">{error}</div> : null}

          <button className="btn" disabled={loading} type="submit">
            {loading ? "Saving..." : "Next"}
          </button>
        </form>
      </div>

      <style>{styles}</style>
    </div>
  );
}

function Option({ label, checked, onClick }) {
  return (
    <button className={checked ? "opt opt--on" : "opt"} type="button" onClick={onClick}>
      <span className="opt__label">{label}</span>
      <span className={checked ? "opt__box opt__box--on" : "opt__box"} />
    </button>
  );
}

const styles = `
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
    align-items:flex-start;
    padding: 28px 16px 40px;
    background: var(--bg);
    color: var(--text);
  }

  .card{
    width: min(520px, 100%);
    display:flex;
    flex-direction:column;
    gap: 12px;
  }

  .title{
    margin: 0;
    font-weight: 900;
    letter-spacing: .02em;
    font-size: 32px;
    text-transform: uppercase;
  }

  .sub{ color: var(--muted); font-size: 13px; }

  .form{ display:flex; flex-direction:column; gap: 14px; }

  .section{
    background: rgba(255,255,255,.55);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px;
    display:flex;
    flex-direction:column;
    gap: 10px;
  }

  .section__title{
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .02em;
    font-size: 14px;
  }

  .input{
    height: 48px;
    border-radius: 10px;
    border: 1px solid var(--border);
    padding: 0 12px;
    font-size: 14px;
    background: var(--white);
  }

  .options{ display:flex; flex-direction:column; gap: 10px; }

  .opt{
    width: 100%;
    min-height: 46px;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 10px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding: 10px 12px;
    cursor:pointer;
    text-align:left;
  }

  .opt--on{
    outline: 2px solid rgba(80, 160, 120, .25);
  }

  .opt__label{ font-size: 14px; font-weight: 600; color: var(--text); }

  .opt__box{
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 1.5px solid rgba(0,0,0,.35);
    background: transparent;
  }

  .opt__box--on{ background: #111; }

  .error{ color: #b00020; font-size: 13px; }

  .btn{
    margin-top: 6px;
    width: 100%;
    height: 48px;
    border-radius: 10px;
    border: 1px solid transparent;
    background: var(--primary);
    font-weight: 800;
    cursor:pointer;
  }

  .btn:disabled{ opacity: .7; cursor: not-allowed; }
`;
