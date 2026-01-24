import React, { useMemo, useState, useRef, useEffect } from "react";
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

function WeightPicker({ value, onChange, unit }) {
  const scrollRef = useRef(null);
  const itemHeight = 50;
  const visibleItems = 5;
  
  const { values, format } = useMemo(() => {
    if (unit === "kg") {
      const min = 20;
      const max = 300;
      const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      return { values, format: (v) => `${v} kg` };
    } else {
      const min = 44; // ~20 kg
      const max = 660; // ~300 kg
      const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      return { values, format: (v) => `${v} lbs` };
    }
  }, [unit]);

  const selectedIndex = useMemo(() => {
    if (unit === "kg") {
      return values.findIndex(v => v === value);
    } else {
      const lbs = kgToLbs(value);
      return values.findIndex(v => v === lbs);
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
    
    const newValue = values[clampedIndex];
    if (unit === "kg") {
      if (newValue !== value) {
        onChange(newValue);
      }
    } else {
      const kg = lbsToKg(newValue);
      if (kg !== value) {
        onChange(kg);
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

export default function Step4Weight() {
  const navigate = useNavigate();
  const draft = loadOnboardingDraft() || {};

  const [unit, setUnit] = useState("kg");
  const [kg, setKg] = useState(Number(draft.weight || 0) || 80);

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
          <div className="ob-title">WHAT'S YOUR WEIGHT?</div>
          <div className="ob-sub">Select your weight.</div>

          <div style={{ marginTop: 40, marginBottom: 40 }}>
            <WeightPicker value={kg} onChange={setKg} unit={unit} />
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
                  background: unit === "kg" ? "rgba(0,0,0,.08)" : "transparent",
                  minWidth: 60
                }}
                onClick={() => setUnit("kg")}
                type="button"
              >
                KG
              </button>
              <button
                className="ob-btn"
                style={{ 
                  border: "none", 
                  borderRadius: 0, 
                  background: unit === "lbs" ? "rgba(0,0,0,.08)" : "transparent",
                  minWidth: 60
                }}
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
