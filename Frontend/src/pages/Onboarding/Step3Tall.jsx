import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadOnboardingDraft, saveOnboardingDraft } from "../../state/onboardingStore";
import { baseOnboardingStyles, Progress } from "./_ui.jsx";
import ROUTE_PATH from "../../constants/routePath";

function cmToFtIn(cm) {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn - ft * 12);
  return { ft, inch };
}

function ftInToCm(ft, inch) {
  return Math.round((ft * 12 + inch) * 2.54);
}

export default function Step3Tall() {
  const navigate = useNavigate();
  const draft = loadOnboardingDraft() || {};

  const [unit, setUnit] = useState("cm");
  const [cm, setCm] = useState(Number(draft.tall || 0) || 180);

  const ftIn = useMemo(() => cmToFtIn(cm), [cm]);

  function back() {
    saveOnboardingDraft({ ...draft, tall: cm });
    navigate(ROUTE_PATH.ONBOARDING_STEP_2);
  }

  function next() {
    saveOnboardingDraft({ ...draft, tall: cm });
    navigate(ROUTE_PATH.ONBOARDING_STEP_4);
  }

  return (
    <div className="ob-page">
      <div>
        <Progress current={3} total={8} />
        <div className="ob-content">
          <div className="ob-title">HOW TALL ARE YOU?</div>
          <div className="ob-sub">Select your height.</div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {unit === "cm" ? (
              <input
                className="ob-input"
                type="number"
                min={80}
                max={250}
                value={cm}
                onChange={(e) => setCm(Number(e.target.value))}
              />
            ) : (
              <div style={{ display: "flex", gap: 10, width: "100%" }}>
                <input
                  className="ob-input"
                  type="number"
                  min={3}
                  max={8}
                  value={ftIn.ft}
                  onChange={(e) => setCm(ftInToCm(Number(e.target.value), ftIn.inch))}
                />
                <input
                  className="ob-input"
                  type="number"
                  min={0}
                  max={11}
                  value={ftIn.inch}
                  onChange={(e) => setCm(ftInToCm(ftIn.ft, Number(e.target.value)))}
                />
              </div>
            )}

            <div style={{ display: "flex", border: "1px solid rgba(0,0,0,.14)", borderRadius: 10, overflow: "hidden" }}>
              <button
                className="ob-btn"
                style={{ border: "none", borderRadius: 0, background: unit === "cm" ? "rgba(0,0,0,.08)" : "transparent" }}
                onClick={() => setUnit("cm")}
                type="button"
              >
                CM
              </button>
              <button
                className="ob-btn"
                style={{ border: "none", borderRadius: 0, background: unit === "ft" ? "rgba(0,0,0,.08)" : "transparent" }}
                onClick={() => setUnit("ft")}
                type="button"
              >
                FT
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
