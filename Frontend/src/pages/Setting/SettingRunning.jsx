import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import planService from "../../services/planService";
import "./SettingRunning.css";

const DEFAULTS = {
  dailyKm: 3,
  weeklyKm: 15,
  monthlyKm: 60,
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// helper: lấy km từ API response, fallback defaults nếu không có
function pickKm(plan, fallback) {
  const v = plan?.totalDistance;
  return Number.isFinite(Number(v)) ? Number(v) : fallback;
}

const SettingRunning = () => {
  const [dailyKm, setDailyKm] = useState(DEFAULTS.dailyKm);
  const [weeklyKm, setWeeklyKm] = useState(DEFAULTS.weeklyKm);
  const [monthlyKm, setMonthlyKm] = useState(DEFAULTS.monthlyKm);
  const [loading, setLoading] = useState(true);

  const suggestions = useMemo(() => {
    return {
      dailyToWeekly: dailyKm * 7,
      weeklyToMonthly: weeklyKm * 4,
    };
  }, [dailyKm, weeklyKm]);

  // Load goals from DB (NOT localStorage)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        // Bạn có thể truyền date hiện tại, hoặc để BE tự default now
        // const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        // const res = await planService.getPlansByDate(today);

        const res = await planService.getPlansByDate(); // nếu BE default now

        if (!mounted) return;

        if (!res?.success) {
          // fail -> fallback defaults
          setDailyKm(DEFAULTS.dailyKm);
          setWeeklyKm(DEFAULTS.weeklyKm);
          setMonthlyKm(DEFAULTS.monthlyKm);
          toast.error(res?.message || "Không lấy được goals từ server");
          return;
        }

        const daily = res?.data?.daily;
        const weekly = res?.data?.weekly;
        const monthly = res?.data?.monthly;

        // Nếu server trả về plan thiếu totalDistance thì mới fallback defaults
        const d = pickKm(daily, DEFAULTS.dailyKm);
        const w = pickKm(weekly, DEFAULTS.weeklyKm);
        const m = pickKm(monthly, DEFAULTS.monthlyKm);

        setDailyKm(d);
        setWeeklyKm(w);
        setMonthlyKm(m);
      } catch (e) {
        console.log(e);
        if (!mounted) return;
        setDailyKm(DEFAULTS.dailyKm);
        setWeeklyKm(DEFAULTS.weeklyKm);
        setMonthlyKm(DEFAULTS.monthlyKm);
        toast.error("Có lỗi khi load goals");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const validate = (payload) => {
    if (payload.weeklyKm < payload.dailyKm) {
      return "Weekly distance cannot be less than daily distance";
    }
    if (payload.monthlyKm < payload.weeklyKm) {
      return "Monthly distance cannot be less than weekly distance";
    }
    return null;
  };

  const onSave = async () => {
    const payload = {
      dailyKm: clamp(toNumber(dailyKm), 0, 60),
      weeklyKm: clamp(toNumber(weeklyKm), 0, 300),
      monthlyKm: clamp(toNumber(monthlyKm), 0, 1200),
    };

    const err = validate(payload);
    if (err) {
      toast.error(err);
      return;
    }

    const loadingId = toast.loading("Đang lưu setting...");
    try {
      const res = await planService.upsertGoalSettings(payload);
      toast.dismiss(loadingId);

      if (!res?.success) {
        toast.error(res?.message || "Lưu thất bại");
        return;
      }

      // ✅ KHÔNG lưu localStorage nữa
      toast.success("✅ Setting thành công");
    } catch (e) {
      console.log(e);
      toast.dismiss(loadingId);
      toast.error("Lưu thất bại");
    }
  };

  // Reset chỉ đổi UI, KHÔNG ghi DB, KHÔNG ghi localStorage
  const onReset = () => {
    setDailyKm(DEFAULTS.dailyKm);
    setWeeklyKm(DEFAULTS.weeklyKm);
    setMonthlyKm(DEFAULTS.monthlyKm);
    toast("Reset to default (not saved yet)", { icon: "↩️" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6fb] px-4 pb-10 pt-6 loading-container">
        <div className="mx-auto w-full max-w-[520px]">
          <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/10 loading-card">
            <div className="inline-block">
              <div className="animate-spin h-8 w-8 border-4 border-black/20 border-t-black/60 rounded-full"></div>
            </div>
            <div className="mt-3 text-sm font-extrabold text-black">
              Loading goals...
            </div>
            <div className="mt-1 text-sm font-semibold text-black/55">
              Please wait a moment.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-10 pt-6 setting-running-container">
      <div className="mx-auto w-full max-w-[520px] setting-content">
        {/* Header */}
        <div className="flex items-center justify-center">
          {/* <button
            type="button"
            onClick={() => window.history.back()}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-black/10 active:scale-[0.98]"
            aria-label="Back"
            title="Back"
          >
            ←
          </button> */}

          <div className="text-center">
            <div className="text-lg font-extrabold text-black">Run Settings</div>
            <div className="text-xs font-semibold text-black/45">
              Set your daily / weekly / monthly goals
            </div>
          </div>

          {/* <div className="w-11" /> */}
        </div>

        {/* Info card */}
        <div className="mt-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/10 info-card">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              🎯
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-black">
                Your running goals
              </div>
              <div className="mt-1 text-sm font-semibold text-black/55">
                These goals are used to track your progress.
              </div>
              <div className="mt-2 text-xs font-semibold text-black/45">
                Tip: Daily × 7 ≈ {suggestions.dailyToWeekly.toFixed(0)} km/week •
                Weekly × 4 ≈ {suggestions.weeklyToMonthly.toFixed(0)} km/month
              </div>
            </div>
          </div>
        </div>

        {/* Goal cards */}
        <div className="mt-4 grid gap-3 goal-cards-grid">
          <GoalCard
            title="Daily goal"
            subtitle="Kilometers you want to run each day"
            icon="📅"
            tone="emerald"
            value={dailyKm}
            unit="km"
            min={0}
            max={60}
            step={0.5}
            onChange={setDailyKm}
            quick={[0, 2, 3, 5, 8, 10]}
          />

          <GoalCard
            title="Weekly goal"
            subtitle="Kilometers you want to run each week"
            icon="🗓️"
            tone="sky"
            value={weeklyKm}
            unit="km"
            min={0}
            max={300}
            step={1}
            onChange={setWeeklyKm}
            quick={[0, 10, 15, 20, 30, 40]}
          />

          <GoalCard
            title="Monthly goal"
            subtitle="Kilometers you want to run each month"
            icon="📆"
            tone="amber"
            value={monthlyKm}
            unit="km"
            min={0}
            max={1200}
            step={5}
            onChange={setMonthlyKm}
            quick={[0, 50, 80, 100, 150, 200]}
          />
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-3 actions-grid">
          <button
            type="button"
            onClick={onReset}
            className="rounded-2xl bg-white px-4 py-4 text-base font-extrabold text-black shadow-sm ring-1 ring-black/12 active:scale-[0.99] action-button reset-button hover:shadow-md hover:ring-black/20 transition-all"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={onSave}
            className="rounded-2xl bg-[#aeead0] px-4 py-4 text-base font-extrabold text-black shadow-sm ring-1 ring-black/10 active:scale-[0.99] action-button save-button hover:shadow-md hover:opacity-90 transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------------- Subcomponents ---------------------- */

function toneClasses(tone) {
  switch (tone) {
    case "emerald":
      return {
        icon: "bg-emerald-50 text-emerald-700",
        bar: "accent-emerald-600",
        pill: "bg-emerald-100 text-emerald-700",
      };
    case "sky":
      return {
        icon: "bg-sky-50 text-sky-700",
        bar: "accent-sky-600",
        pill: "bg-sky-100 text-sky-700",
      };
    case "amber":
      return {
        icon: "bg-amber-50 text-amber-700",
        bar: "accent-amber-600",
        pill: "bg-amber-100 text-amber-700",
      };
    default:
      return {
        icon: "bg-black/5 text-black",
        bar: "accent-black",
        pill: "bg-black/5 text-black",
      };
  }
}

function GoalCard({
  title,
  subtitle,
  icon,
  tone,
  value,
  unit,
  min,
  max,
  step,
  onChange,
  quick = [],
}) {
  const t = toneClasses(tone);
  const safeValue = clamp(toNumber(value), min, max);

  const onInput = (v) => {
    const n = toNumber(v);
    onChange(clamp(n, min, max));
  };

  return (
    <div className={[
      "rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/10",
      "goal-card transition-all duration-300"
    ].join(" ")}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={[
              "grid h-10 w-10 place-items-center rounded-2xl",
              t.icon,
            ].join(" ")}
          >
            <span className="text-lg">{icon}</span>
          </div>

          <div className="min-w-0">
            <div className="text-sm font-extrabold text-black">{title}</div>
            <div className="mt-1 text-sm font-semibold text-black/55">
              {subtitle}
            </div>
          </div>
        </div>

        <div
          className={[
            "rounded-2xl px-3 py-2 text-sm font-extrabold",
            t.pill,
          ].join(" ")}
        >
          {safeValue.toFixed(step < 1 ? 1 : 0)} {unit}
        </div>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeValue}
          onChange={(e) => onInput(e.target.value)}
          className={["w-full slider-input", t.bar].join(" ")}
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-xs font-semibold text-black/45">
            {min} {unit}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              min={min}
              max={max}
              step={step}
              value={safeValue}
              onChange={(e) => onInput(e.target.value)}
              className="w-28 rounded-2xl border border-black/10 bg-[#f4f6fb] px-3 py-2 text-right text-sm font-extrabold text-black outline-none focus:ring-2 focus:ring-black/10 number-input transition-all"
            />
            <div className="text-sm font-bold text-black/60">{unit}</div>
          </div>

          <div className="text-xs font-semibold text-black/45">
            {max} {unit}
          </div>
        </div>
      </div>

      {quick?.length ? (
        <div className="mt-4 flex flex-wrap gap-2 quick-buttons">
          {quick.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onInput(q)}
              className="rounded-2xl bg-black/5 px-3 py-2 text-xs font-extrabold text-black/70 ring-1 ring-black/10 active:scale-[0.99] quick-btn hover:bg-black/10 hover:ring-black/15 transition-all"
            >
              {q} {unit}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default SettingRunning;
