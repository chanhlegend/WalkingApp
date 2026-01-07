import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadOnboardingDraft, saveOnboardingDraft } from "../../state/onboardingStore";
import { baseOnboardingStyles, Progress } from "./_ui.jsx";
import ROUTE_PATH from "../../constants/routePath";

const OPTIONS = [
  { key: "male", label: "Man" },
  { key: "female", label: "Woman" },
  { key: "other", label: "Other" },
  { key: "na", label: "I don't want to answer" },
];

export default function Step2Gender() {
  const navigate = useNavigate();
  const draft = loadOnboardingDraft() || {};
  const [gender, setGender] = useState(draft.gender || "");

  function back() {
    saveOnboardingDraft({ ...draft, gender });
    navigate(ROUTE_PATH.ONBOARDING_STEP_1);
  }

  function next() {
    saveOnboardingDraft({ ...draft, gender });
    navigate(ROUTE_PATH.ONBOARDING_STEP_3);
  }

  return (
    <div className="ob-page">
      <div>
        <Progress current={2} total={8} />
        <div className="ob-content">
          <div className="ob-title">WHAT’S YOUR GENDER?</div>
          <div className="ob-sub">Select an option.</div>

          <div className="ob-options">
            {OPTIONS.map((o) => (
              <div
                key={o.key}
                className={`ob-option ${gender === o.key ? "ob-option--selected" : ""}`}
                onClick={() => setGender(o.key)}
                role="button"
                tabIndex={0}
              >
                <div>{o.label}</div>
                <div>{gender === o.key ? "✓" : ""}</div>
              </div>
            ))}
          </div>

          <div className="ob-actions">
            <button className="ob-btn" onClick={back}>← Back</button>
            <button className="ob-btn ob-btn--primary" onClick={next} disabled={!gender}>
              Next →
            </button>
          </div>
        </div>
      </div>
      <style>{baseOnboardingStyles}</style>
    </div>
  );
}
