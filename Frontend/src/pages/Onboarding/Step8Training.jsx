import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/authen";
import {
  clearOnboardingDraft,
  loadOnboardingDraft,
  saveOnboardingDraft,
} from "../../state/onboardingStore";
import { baseOnboardingStyles, Progress } from "./_ui.jsx";
import ROUTE_PATH from "../../constants/routePath";

const OPTIONS = [
  { key: "5k", label: "5K race" },
  { key: "10k", label: "10K race" },
  { key: "half-marathon", label: "Half marathon" },
  { key: "full-marathon", label: "Full marathon" },
  { key: "triathlon", label: "Triathlon" },
  { key: "general", label: "General fitness & wellness" },
  { key: "none", label: "Not training for an event" },
];

export default function Step8Training() {
  const navigate = useNavigate();
  const draft = loadOnboardingDraft() || {};

  const [trainingRunning, setTrainingRunning] = useState(
    draft.trainingRunning || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function back() {
    saveOnboardingDraft({ ...draft, trainingRunning });
    navigate(ROUTE_PATH.ONBOARDING_STEP_7);
  }

  async function finish() {
    setError("");

    if (!trainingRunning) {
      setError("Please select an option.");
      return;
    }

    // persist latest choice to draft
    saveOnboardingDraft({ ...draft, trainingRunning });

    setLoading(true);
    try {
      const payload = {
        fullName: draft.fullName,
        gender: draft.gender === "na" ? undefined : draft.gender,
        tall: draft.tall,
        weight: draft.weight,
        experiencePoints: draft.experiencePoints,
        regularity: draft.regularity,
        goal: draft.goal,
        trainingRunning,
      };

      const res = await AuthService.submitOnboarding(payload); // { user }

      clearOnboardingDraft();

      // backend sets onboardingCompleted=true, so go HOME
      if (res?.user?.onboardingCompleted) {
        navigate(ROUTE_PATH.HOME, { replace: true });
      } else {
        // fallback
        navigate(ROUTE_PATH.HOME, { replace: true });
      }
    } catch (e) {
      setError(e?.message || "Failed to save onboarding");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ob-page">
      <div>
        <Progress current={8} total={8} />
        <div className="ob-content">
          <div className="ob-title">ARE YOU TRAINING FOR A SPECIFIC EVENT?</div>
          <div className="ob-sub">Select an option.</div>

          <div className="ob-options">
            {OPTIONS.map((o) => (
              <div
                key={o.key}
                className={`ob-option ${
                  trainingRunning === o.key ? "ob-option--selected" : ""
                }`}
                onClick={() => setTrainingRunning(o.key)}
                role="button"
                tabIndex={0}
              >
                <div>{o.label}</div>
                <div>{trainingRunning === o.key ? "✓" : ""}</div>
              </div>
            ))}
          </div>

          {error ? (
            <div style={{ color: "#b00020", fontSize: 13, marginTop: 10 }}>
              {error}
            </div>
          ) : null}

          <div className="ob-actions">
            <button className="ob-btn" onClick={back} disabled={loading}>
              ← Back
            </button>
            <button
              className="ob-btn ob-btn--primary"
              onClick={finish}
              disabled={!trainingRunning || loading}
            >
              {loading ? "Saving..." : "Next →"}
            </button>
          </div>
        </div>
      </div>
      <style>{baseOnboardingStyles}</style>
    </div>
  );
}