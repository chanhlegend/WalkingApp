import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadOnboardingDraft, saveOnboardingDraft } from "../../state/onboardingStore";
import { baseOnboardingStyles, Progress } from "./_ui.jsx";
import ROUTE_PATH from "../../constants/routePath";

const OPTIONS = [
  { key: "1-2", label: "1-2 times" },
  { key: "3-4", label: "3-4 times" },
  { key: "5+", label: "5+ times" },
  { key: "not-yet", label: "I don't run yet but I want to start" },
];

export default function Step6Regularity() {
  const navigate = useNavigate();
  const draft = loadOnboardingDraft() || {};
  const [regularity, setRegularity] = useState(draft.regularity || "");

  function back() {
    saveOnboardingDraft({ ...draft, regularity });
    navigate(ROUTE_PATH.ONBOARDING_STEP_5);
  }

  function next() {
    saveOnboardingDraft({ ...draft, regularity });
    navigate(ROUTE_PATH.ONBOARDING_STEP_7);
  }

  return (
    <div className="ob-page">
      <div>
        <Progress current={6} total={8} />
        <div className="ob-content">
          <div className="ob-title">HOW OFTEN DO YOU RUN?</div>
          <div className="ob-sub">Select an option.</div>

          <div className="ob-options">
            {OPTIONS.map((o) => (
              <div
                key={o.key}
                className={`ob-option ${regularity === o.key ? "ob-option--selected" : ""}`}
                onClick={() => setRegularity(o.key)}
                role="button"
                tabIndex={0}
              >
                <div>{o.label}</div>
                <div>{regularity === o.key ? "✓" : ""}</div>
              </div>
            ))}
          </div>

          <div className="ob-actions">
            <button className="ob-btn" onClick={back}>← Back</button>
            <button className="ob-btn ob-btn--primary" onClick={next} disabled={!regularity}>Next →</button>
          </div>
        </div>
      </div>
      <style>{baseOnboardingStyles}</style>
    </div>
  );
}
