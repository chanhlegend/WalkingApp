import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadOnboardingDraft, saveOnboardingDraft } from "../../state/onboardingStore";
import { baseOnboardingStyles, Progress } from "./_ui.jsx";
import ROUTE_PATH from "../../constants/routePath";

const OPTIONS = [
  { key: "beginner", label: "Beginner (Just starting out)" },
  { key: "intermediate", label: "Intermediate (Run occasionally)" },
  { key: "advanced", label: "Advanced (Run regularly)" },
];

export default function Step5Experience() {
  const navigate = useNavigate();
  const draft = loadOnboardingDraft() || {};
  const [experiencePoints, setExperiencePoints] = useState(draft.experiencePoints || "");

  function back() {
    saveOnboardingDraft({ ...draft, experiencePoints });
    navigate(ROUTE_PATH.ONBOARDING_STEP_4);
  }

  function next() {
    saveOnboardingDraft({ ...draft, experiencePoints });
    navigate(ROUTE_PATH.ONBOARDING_STEP_6);
  }

  return (
    <div className="ob-page">
      <div>
        <Progress current={5} total={8} />
        <div className="ob-content">
          <div className="ob-title">WHAT'S YOUR RUNNING EXPERIENCE?</div>
          <div className="ob-sub">Select an option.</div>

          <div className="ob-options">
            {OPTIONS.map((o) => (
              <div
                key={o.key}
                className={`ob-option ${experiencePoints === o.key ? "ob-option--selected" : ""}`}
                onClick={() => setExperiencePoints(o.key)}
                role="button"
                tabIndex={0}
              >
                <div>{o.label}</div>
                <div>{experiencePoints === o.key ? "✓" : ""}</div>
              </div>
            ))}
          </div>

          <div className="ob-actions">
            <button className="ob-btn" onClick={back}>← Back</button>
            <button className="ob-btn ob-btn--primary" onClick={next} disabled={!experiencePoints}>Next →</button>
          </div>
        </div>
      </div>
      <style>{baseOnboardingStyles}</style>
    </div>
  );
}
