import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadOnboardingDraft, saveOnboardingDraft } from "../../state/onboardingStore";
import { baseOnboardingStyles, Progress } from "./_ui.jsx";
import ROUTE_PATH from "../../constants/routePath";

const OPTIONS = [
  { key: "endurance", label: "Improve endurance" },
  { key: "speed", label: "Increase speed" },
  { key: "lose-weight", label: "Lose weight" },
  { key: "fit-healthy", label: "Stay fit & healthy" },
  { key: "fun", label: "Just for fun" },
];

export default function Step7Goal() {
  const navigate = useNavigate();
  const draft = loadOnboardingDraft() || {};
  const [goal, setGoal] = useState(draft.goal || "");

  function back() {
    saveOnboardingDraft({ ...draft, goal });
    navigate(ROUTE_PATH.ONBOARDING_STEP_6);
  }

  function next() {
    saveOnboardingDraft({ ...draft, goal });
    navigate(ROUTE_PATH.ONBOARDING_STEP_8);
  }

  return (
    <div className="ob-page">
      <div>
        <Progress current={7} total={8} />
        <div className="ob-content">
          <div className="ob-title">WHAT’S YOUR RUNNING GOAL?</div>
          <div className="ob-sub">Select an option.</div>

          <div className="ob-options">
            {OPTIONS.map((o) => (
              <div
                key={o.key}
                className={`ob-option ${goal === o.key ? "ob-option--selected" : ""}`}
                onClick={() => setGoal(o.key)}
                role="button"
                tabIndex={0}
              >
                <div>{o.label}</div>
                <div>{goal === o.key ? "✓" : ""}</div>
              </div>
            ))}
          </div>

          <div className="ob-actions">
            <button className="ob-btn" onClick={back}>← Back</button>
            <button className="ob-btn ob-btn--primary" onClick={next} disabled={!goal}>Next →</button>
          </div>
        </div>
      </div>
      <style>{baseOnboardingStyles}</style>
    </div>
  );
}
