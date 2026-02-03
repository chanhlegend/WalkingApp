import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, TrendingUp, Zap } from "lucide-react";
import runProcessService from "../../services/runProcessService";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useNavigate } from "react-router-dom";
import ROUTE_PATH from "../../constants/routePath";

const RANGES = [
  { key: "today", label: "Today" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

const EMPTY_DATA = {
  distance: 0,
  runs: 0,
  time: 0,
  pace: 0,
  trend: [],
  lastUpdatedAt: null,
  personalBests: { longest: 0, fastest: 0, bestWeek: 0, streak: 0 },
  planProgress: 0,
  planTarget: 0,
};

function formatValue(value, digits = 1) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return value.toFixed(digits);
}

function formatLastUpdated(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return `Today ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
  return d.toLocaleDateString();
}

export default function StatsPage() {
  const [range, setRange] = useState("week");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(EMPTY_DATA);

  const navigate = useNavigate();

  const data = useMemo(() => stats || EMPTY_DATA, [stats]);
  const hasRuns = (data?.runs || 0) > 0;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError("");
      const result = await runProcessService.getStatsDashboard(range);
      if (cancelled) return;
      if (result?.success && result?.data) {
        setStats({ ...EMPTY_DATA, ...result.data });
      } else {
        setStats(EMPTY_DATA);
        setError(result?.message || "Failed to load statistics");
      }
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F6F1E8" }}>
      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Page Header */}
        <div className="mb-5 rounded-2xl border border-black/10 bg-white/80 p-4 shadow-[0_8px_20px_rgba(0,0,0,0.06)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-black tracking-tight text-black">Statistics</h1>
              <div className="mt-0.5 text-sm font-semibold text-black/55">
                Overview, trends, and personal bests
              </div>
            </div>
            
          </div>
        </div>

        {/* Range Selector */}
        <div className="mb-6 flex justify-center gap-2 md:justify-start">
          {RANGES.map((r) => {
            const active = range === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={
                  "rounded-full px-4 py-2 text-sm font-medium transition-all " +
                  (active
                    ? "font-bold text-black"
                    : "border border-black/15 text-black/60 hover:border-black/30")
                }
                style={active ? { backgroundColor: "#A7E6CF" } : undefined}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-black/5 bg-white p-8 text-center text-sm font-semibold text-black/60 shadow-sm">
            Loading…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-black/5 bg-white p-8 text-center text-sm font-semibold text-black/70 shadow-sm">
            {error}
          </div>
        ) : !hasRuns ? (
          // Empty State
          <div className="rounded-2xl border border-black/5 bg-white p-8 text-center shadow-sm md:p-12">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: "#A7E6CF" }}
            >
              <Zap size={32} className="text-white" />
            </div>
            <h2 className="mb-2 text-xl font-bold">No runs yet</h2>
            <p className="text-black/60">Get started by logging your first run!</p>
          </div>
        ) : (
          <>
            {/* Quick Overview Card */}
            <div className="mb-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold">Quick overview</h2>
                <ChevronDown size={18} className="text-black/40" />
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: "Total Distance", value: data.distance, unit: "KM" },
                  { label: "Total Runs", value: data.runs, unit: "runs" },
                  { label: "Total Time", value: data.time, unit: "hours" },
                  { label: "Avg Pace", value: data.pace, unit: "min/km" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="mb-1 text-sm text-black/60">{stat.label}</p>
                    <p className="text-3xl font-black" style={{ color: "#A7E6CF" }}>
                      {typeof stat.value === "number"
                        ? formatValue(stat.value, stat.label === "Total Runs" ? 0 : 1)
                        : stat.value}
                    </p>
                    <p className="mt-1 text-xs text-black/40">{stat.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trends Card */}
            <div className="mb-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">Trends</h2>
                  <TrendingUp size={18} style={{ color: "#A7E6CF" }} />
                </div>
                <div className="text-xs font-semibold text-black/50">
                  Last updated: {formatLastUpdated(data.lastUpdatedAt)}
                </div>
              </div>

              <div className="rounded-xl border border-black/10 bg-[#FAFAFA] p-3">
                <div className="h-[220px] w-full overflow-hidden rounded-xl bg-white">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={Array.isArray(data.trend) ? data.trend : []}
                      margin={{ top: 14, right: 18, bottom: 10, left: 10 }}
                    >
                      <CartesianGrid stroke="rgba(0,0,0,0.08)" strokeDasharray="4 6" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12, fill: "rgba(0,0,0,0.55)" }}
                        axisLine={{ stroke: "rgba(0,0,0,0.10)" }}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="distance"
                        tick={{ fontSize: 12, fill: "rgba(0,0,0,0.55)" }}
                        axisLine={false}
                        tickLine={false}
                        width={34}
                      />
                      <YAxis
                        yAxisId="pace"
                        orientation="right"
                        tick={{ fontSize: 12, fill: "rgba(0,0,0,0.55)" }}
                        axisLine={false}
                        tickLine={false}
                        width={34}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid rgba(0,0,0,0.10)",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
                        }}
                        formatter={(value, name) => {
                          if (name === "Distance") return [`${formatValue(Number(value), 2)} km`, name];
                          if (name === "Pace") return [`${formatValue(Number(value), 2)} min/km`, name];
                          return [value, name];
                        }}
                        labelStyle={{ fontWeight: 800, color: "rgba(0,0,0,0.75)" }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={28}
                        iconType="circle"
                        wrapperStyle={{ fontSize: 12, color: "rgba(0,0,0,0.65)" }}
                      />

                      <Line
                        yAxisId="distance"
                        type="monotone"
                        dataKey="distance"
                        name="Distance"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        yAxisId="pace"
                        type="monotone"
                        dataKey="pace"
                        name="Pace"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs font-semibold text-black/60">
                  <div>
                    <span className="mr-3 inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Distance (km)
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                      Pace (min/km)
                    </span>
                  </div>
                  <div className="text-black/50">
                    Tip: tap points to compare
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Bests */}
            <div className="mb-6">
              <h2 className="mb-4 text-lg font-bold">Personal bests</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { label: "Longest run", value: data.personalBests.longest, unit: "KM" },
                  { label: "Fastest pace", value: data.personalBests.fastest, unit: "min/km" },
                  { label: "Best week", value: data.personalBests.bestWeek, unit: "KM" },
                  { label: "Streak", value: data.personalBests.streak, unit: "days" },
                ].map((best) => (
                  <div
                    key={best.label}
                    className="rounded-2xl border border-black/5 bg-white p-4 text-center shadow-sm"
                  >
                    <p className="mb-2 text-sm text-black/60">{best.label}</p>
                    <p className="text-2xl font-black" style={{ color: "#A7E6CF" }}>
                      {typeof best.value === "number" ? formatValue(best.value, best.label === "Streak" ? 0 : 1) : "--"}
                    </p>
                    <p className="mt-1 text-xs text-black/40">{best.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Progress */}
            <div className="mb-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold">Active plan</h2>

              <div className="mb-4">
                <p className="mb-2 font-semibold text-black/80">Build Endurance Plan</p>
                <div className="h-2 w-full rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (data.planProgress / data.planTarget) * 100)}%`,
                      backgroundColor: "#A7E6CF",
                    }}
                  />
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-black/60">Completed</p>
                  <p className="font-bold">
                    {formatValue(data.planProgress, 0)}/{formatValue(data.planTarget, 0)} KM
                  </p>
                </div>
                <div>
                  <p className="text-black/60">Remaining</p>
                  <p className="font-bold">
                    {formatValue(data.planTarget - data.planProgress, 0)} KM
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-lg py-2.5 font-semibold transition-all"
                  style={{ backgroundColor: "#A7E6CF", color: "black" }}
                  onClick={() => {
                    navigate(ROUTE_PATH.SETTING_RUNNING);
                  }}
                >
                  View plan
                </button>
              </div>
            </div>

            
          </>
        )}
      </div>
    </div>
  );
}
