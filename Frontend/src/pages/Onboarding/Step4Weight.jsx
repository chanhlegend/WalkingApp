import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadOnboardingDraft, saveOnboardingDraft } from "../../state/onboardingStore";
import { baseOnboardingStyles, Progress } from "./_ui.jsx";
import ROUTE_PATH from "../../constants/routePath";

function kgToLbs(kg) {
  return Math.round(kg * 2.20462);
}

function lbsToKg(lbs) {
  return Math.round(lbs / 2.20462);
}

export default function Step4Weight() {
  const navigate = useNavigate();
  const draft = loadOnboardingDraft() || {};

  const [unit, setUnit] = useState("kg");
  const [kg, setKg] = useState(Number(draft.weight || 0) || 80);
  const lbs = useMemo(() => kgToLbs(kg), [kg]);

  function back() {
    saveOnboardingDraft({ ...draft, weight: kg });
    navigate(ROUTE_PATH.ONBOARDING_STEP_3);
  }

  function next() {
    saveOnboardingDraft({ ...draft, weight: kg });
    navigate(ROUTE_PATH.ONBOARDING_STEP_5);
  }

  return (
    <div className="ob-page">
      <div>
        <Progress current={4} total={8} />
        <div className="ob-content">
          <div className="ob-title">WHAT’S YOUR WEIGHT?</div>
          <div className="ob-sub">Select your weight.</div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {unit === "kg" ? (
              <input
                className="ob-input"
                type="number"
                min={20}
                max={300}
                value={kg}
                onChange={(e) => setKg(Number(e.target.value))}
              />
            ) : (
              <input
                className="ob-input"
                type="number"
                min={44}
                max={660}
                value={lbs}
                onChange={(e) => setKg(lbsToKg(Number(e.target.value)))}
              />
            )}

            <div style={{ display: "flex", border: "1px solid rgba(0,0,0,.14)", borderRadius: 10, overflow: "hidden" }}>
              <button
                className="ob-btn"
                style={{ border: "none", borderRadius: 0, background: unit === "kg" ? "rgba(0,0,0,.08)" : "transparent" }}
                onClick={() => setUnit("kg")}
                type="button"
              >
                KG
              </button>
              <button
                className="ob-btn"
                style={{ border: "none", borderRadius: 0, background: unit === "lbs" ? "rgba(0,0,0,.08)" : "transparent" }}
                onClick={() => setUnit("lbs")}
                type="button"
              >
                LBS
              </button>
            </div>
          </div>

          <div className="ob-actions">
            <button className="ob-btn" onClick={back}>← Back</button>
            <button className="ob-btn ob-btn--primary" onClick={next}>Next →</button>
          </div>
        </div>
      </div>
      <style>{baseOnboardingStyles}</style>
    </div>
  );
}
