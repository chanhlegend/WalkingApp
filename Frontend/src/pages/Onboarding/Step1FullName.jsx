import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadOnboardingDraft, saveOnboardingDraft } from "../../state/onboardingStore";
import { baseOnboardingStyles, Progress } from "./_ui.jsx";
import ROUTE_PATH from "../../constants/routePath";

export default function Step1FullName() {
  const navigate = useNavigate();
  const draft = loadOnboardingDraft() || {};

  const [fullName, setFullName] = useState(draft.fullName || "");

  useEffect(() => {
    saveOnboardingDraft({ ...draft, fullName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullName]);

  function next() {
    saveOnboardingDraft({ ...draft, fullName });
    navigate(ROUTE_PATH.ONBOARDING_STEP_2);
  }

  return (
    <div className="ob-page">
      <div>
        <Progress current={1} total={8} />
        <div className="ob-content">
          <div className="ob-title">WHAT’S YOUR FULL NAME?</div>
          <input className="ob-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <div className="ob-actions">
            <div />
            <button className="ob-btn ob-btn--primary" onClick={next} disabled={!fullName.trim()}>
              Next
            </button>
          </div>
        </div>
      </div>
      <style>{baseOnboardingStyles}</style>
    </div>
  );
}
