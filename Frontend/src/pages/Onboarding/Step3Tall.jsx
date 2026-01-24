import React, { useMemo, useState, useRef, useEffect } from "react";
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

function HeightPicker({ value, onChange, unit }) {
  const scrollRef = useRef(null);
  const itemHeight = 50;
  const visibleItems = 5;
  
  const { min, max, values, format } = useMemo(() => {
    if (unit === "cm") {
      const min = 80;
      const max = 250;
      const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      return { min, max, values, format: (v) => `${v} cm` };
    } else {
      // For ft/inch, we'll show combined values
      const values = [];
      for (let ft = 3; ft <= 8; ft++) {
        for (let inch = 0; inch <= 11; inch++) {
          values.push({ ft, inch, cm: ftInToCm(ft, inch) });
        }
      }
      return { 
        min: 0, 
        max: values.length - 1, 
        values, 
        format: (v) => `${v.ft}' ${v.inch}"`
      };
    }
  }, [unit]);

  const selectedIndex = useMemo(() => {
    if (unit === "cm") {
      return values.findIndex(v => v === value);
    } else {
      const { ft, inch } = cmToFtIn(value);
      return values.findIndex(v => v.ft === ft && v.inch === inch);
    }
  }, [value, values, unit]);

  useEffect(() => {
    if (scrollRef.current && selectedIndex >= 0) {
      const scrollTop = selectedIndex * itemHeight - (visibleItems - 1) / 2 * itemHeight;
      scrollRef.current.scrollTop = scrollTop;
    }
  }, [selectedIndex]);

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const index = Math.round(scrollTop / itemHeight + (visibleItems - 1) / 2);
    const clampedIndex = Math.max(0, Math.min(values.length - 1, index));
    
    if (unit === "cm") {
      const newValue = values[clampedIndex];
      if (newValue !== value) {
        onChange(newValue);
      }
    } else {
      const newValue = values[clampedIndex];
      if (newValue && newValue.cm !== value) {
        onChange(newValue.cm);
      }
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: itemHeight * visibleItems }}>
      {/* Selection highlight */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        height: itemHeight,
        transform: "translateY(-50%)",
        background: "rgba(0, 0, 0, 0.08)",
        borderTop: "1px solid rgba(0, 0, 0, 0.2)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
        pointerEvents: "none",
        zIndex: 1
      }} />
      
      {/* Scrollable list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          height: "100%",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none"
        }}
      >
        <div style={{ height: itemHeight * (visibleItems - 1) / 2 }} />
        {values.map((v, i) => {
          const isSelected = i === selectedIndex;
          const distance = Math.abs(i - selectedIndex);
          const opacity = Math.max(0.3, 1 - distance * 0.3);
          
          return (
            <div
              key={i}
              style={{
                height: itemHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isSelected ? "24px" : "20px",
                fontWeight: isSelected ? "600" : "400",
                color: `rgba(0, 0, 0, ${opacity})`,
                transition: "all 0.2s ease",
                scrollSnapAlign: "center"
              }}
            >
              {format(v)}
            </div>
          );
        })}
        <div style={{ height: itemHeight * (visibleItems - 1) / 2 }} />
      </div>
      
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default function Step3Tall() {
  const navigate = useNavigate();
  const draft = loadOnboardingDraft() || {};

  const [unit, setUnit] = useState("cm");
  const [cm, setCm] = useState(Number(draft.tall || 0) || 180);

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

          <div style={{ marginTop: 40, marginBottom: 40 }}>
            <HeightPicker value={cm} onChange={setCm} unit={unit} />
          </div>

          <div style={{ 
            display: "flex", 
            justifyContent: "center",
            marginBottom: 30
          }}>
            <div style={{ 
              display: "flex", 
              border: "1px solid rgba(0,0,0,.14)", 
              borderRadius: 10, 
              overflow: "hidden" 
            }}>
              <button
                className="ob-btn"
                style={{ 
                  border: "none", 
                  borderRadius: 0, 
                  background: unit === "cm" ? "rgba(0,0,0,.08)" : "transparent",
                  minWidth: 60
                }}
                onClick={() => setUnit("cm")}
                type="button"
              >
                CM
              </button>
              <button
                className="ob-btn"
                style={{ 
                  border: "none", 
                  borderRadius: 0, 
                  background: unit === "ft" ? "rgba(0,0,0,.08)" : "transparent",
                  minWidth: 60
                }}
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
