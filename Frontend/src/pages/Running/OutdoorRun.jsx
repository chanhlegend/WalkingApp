import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import ROUTE_PATH from "../../constants/routePath";
import { useNavigate } from "react-router-dom";

// Leaflet icons (Vite/CRA)
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: markerShadow,
});

/* ---------------------- Map Helpers ---------------------- */

function MapAutoFix({ center, path }) {
  const map = useMap();

  useEffect(() => {
    const fix = () => {
      map.invalidateSize(true);

      if (path?.length >= 2) {
        const bounds = L.latLngBounds(path.map((p) => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [30, 30] });
      } else if (center) {
        map.setView(center, map.getZoom() || 16, { animate: false });
      }
    };

    const t1 = setTimeout(fix, 0);
    const t2 = setTimeout(fix, 120);
    const t3 = setTimeout(fix, 400);
    const t4 = setTimeout(fix, 900);

    window.addEventListener("resize", fix);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener("resize", fix);
    };
  }, [map, center, path]);

  return null;
}

function RecenterButton({ center }) {
  const map = useMap();
  return (
    <button
      type="button"
      onClick={() =>
        map.setView(center, map.getZoom() || 16, { animate: true })
      }
      className="absolute bottom-24 right-4 z-[1200] grid h-11 w-11 place-items-center rounded-full bg-white/95 shadow-lg ring-1 ring-black/10 backdrop-blur active:scale-[0.98]"
      aria-label="Recenter"
      title="Recenter"
    >
      ⦿
    </button>
  );
}

// Haversine distance (meters)
function haversineMeters(a, b) {
  if (!a || !b) return 0;
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(a.lat);

  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function formatPace(ms, km) {
  if (!km || km <= 0) return "--:--/km";
  const secPerKm = Math.floor(ms / 1000 / km);
  const mm = String(Math.floor(secPerKm / 60)).padStart(2, "0");
  const ss = String(secPerKm % 60).padStart(2, "0");
  return `${mm}:${ss}/km`;
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

/* ---------------------- UI Blocks ---------------------- */


function StatCard({ icon, title, value, suffix, tone = "slate" }) {
  const toneCls =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "rose"
      ? "bg-rose-50 text-rose-700"
      : "bg-slate-50 text-slate-700";

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-black/55">
        <span
          className={[
            "grid h-8 w-8 place-items-center rounded-xl",
            toneCls,
          ].join(" ")}
        >
          {icon}
        </span>
        <span>{title}</span>
      </div>

      <div className="mt-2 flex items-end gap-1">
        <div className="text-3xl font-extrabold text-black">{value}</div>
        {suffix ? (
          <div className="pb-1 text-sm font-semibold text-black/70">
            {suffix}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * ✅ Non-blocking modal (toast style)
 * - pointer-events-none để không chặn thao tác (timer + GPS vẫn chạy bình thường)
 * - chỉ có nút Close (pointer-events-auto) để tắt
 */
function CongratsToast({ open, title, desc, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed left-0 top-0 z-[5000] w-full px-4 pt-4 pointer-events-none">
      <div className="mx-auto w-full max-w-[460px]">
        <div className="pointer-events-auto rounded-3xl bg-[#aeead0] p-4 shadow-lg ring-1 ring-black/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-extrabold text-black">{title}</div>
              <div className="mt-1 text-sm font-semibold text-black/70">
                {desc}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-2xl bg-white/70 text-lg font-bold text-black ring-1 ring-black/10 active:scale-[0.98]"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DistanceGoalCard({ distanceKm, targetKm = 10 }) {
  const pct = Math.max(0, Math.min(1, distanceKm / targetKm));
  const size = 74;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  const gap = c - dash;

  return (
    <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
  {/* TITLE ON TOP */}
  <div className="mb-3 text-sm font-semibold text-black/55">
    Distance goal
  </div>

  <div className="flex items-center gap-4">
    {/* ring */}
    <div className="relative">
      {/* green dot */}
      <div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-emerald-500" />

      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(34,197,94,0.95)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
        />
      </svg>

      <div className="absolute inset-0 grid place-items-center text-center">
        <div className="text-xl font-extrabold text-black leading-none">
          {distanceKm.toFixed(2)}
        </div>
        <div className="mt-1 text-[11px] font-semibold text-black/45">
          km / {targetKm}km
        </div>
      </div>
    </div>

    {/* RIGHT VALUE */}
    <div className="min-w-0">
      <div className="text-lg font-extrabold text-black">
        {distanceKm.toFixed(2)}
      </div>
      <div className="text-sm font-semibold text-black/45">
        km / {targetKm}km
      </div>
    </div>
  </div>
</div>

  );
}

function TimeCard({ elapsedMs }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3 text-sm font-semibold text-black/55">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-black/5">
          🕒
        </span>
        <span>Time</span>
      </div>

      <div className="mt-4 text-4xl font-extrabold text-black tracking-wider">
        {formatTime(elapsedMs)}
      </div>
    </div>
  );
}

/* ---------------------- Main ---------------------- */

export default function OutdoorRun() {
  const targetKm = 10;

  // GPS
  const [pos, setPos] = useState(null);
  const [path, setPath] = useState([]);
  const watchIdRef = useRef(null);

  // Timer
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Distance
  const [distanceM, setDistanceM] = useState(0);

  // Fake HR
  const [avgHr, setAvgHr] = useState(147);

  // UI mode
  const [mode, setMode] = useState("running"); // running | summary

  // Congrats toast
  const [showCongrats, setShowCongrats] = useState(false);
  const didShowCongratsRef = useRef(false);

  const navigate = useNavigate();

  // Timer interval (✅ không phụ thuộc modal)
  useEffect(() => {
    if (isPaused) return;
    if (mode !== "running") return;
    const id = setInterval(() => setElapsedMs((p) => p + 1000), 1000);
    return () => clearInterval(id);
  }, [isPaused, mode]);

  // Geolocation watch (✅ không phụ thuộc modal)
  useEffect(() => {
    if (mode !== "running") return;

    if (!("geolocation" in navigator)) {
      alert("Trình duyệt không hỗ trợ Geolocation.");
      return;
    }

    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => {
        const next = {
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: p.coords.accuracy,
        };

        setPos(next);

        setPath((prev) => {
          if (isPaused) return prev;

          const MAX_ACCURACY = 35;
          if (next.accuracy && next.accuracy > MAX_ACCURACY) return prev;

          const last = prev[prev.length - 1];
          const nextPoint = {
            lat: next.lat,
            lng: next.lng,
            accuracy: next.accuracy,
          };

          if (!last) return [nextPoint];

          const d = haversineMeters(last, nextPoint);
          if (d < 2) return prev;
          if (d > 60) return prev;

          return [...prev, nextPoint];
        });
      },
      (err) => {
        console.error(err);
        alert(
          "Không lấy được vị trí. Hãy bật Location và cho phép quyền truy cập."
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 500,
        timeout: 10000,
      }
    );

    return () => {
      if (watchIdRef.current != null)
        navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isPaused, mode]);

  // Distance incremental
  useEffect(() => {
    if (path.length < 2) return;
    const a = path[path.length - 2];
    const b = path[path.length - 1];
    setDistanceM((prev) => prev + haversineMeters(a, b));
  }, [path]);

  // Fake HR jitter
  useEffect(() => {
    const id = setInterval(() => {
      setAvgHr((v) => {
        const jitter = Math.random() < 0.5 ? -1 : 1;
        return Math.max(120, Math.min(175, v + jitter));
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const distanceKm = distanceM / 1000;
  const completed = distanceKm >= targetKm;

  // ✅ show congrats once, but DO NOT pause/stop anything
  useEffect(() => {
    if (!completed) return;
    if (didShowCongratsRef.current) return;
    didShowCongratsRef.current = true;
    setShowCongrats(true);

    // auto hide after 4s (optional)
    const t = setTimeout(() => setShowCongrats(false), 4000);
    return () => clearTimeout(t);
  }, [completed]);

  const center = useMemo(() => {
    if (pos) return [pos.lat, pos.lng];
    return [21.0587, 105.8105];
  }, [pos]);

  const paceText = useMemo(
    () => formatPace(elapsedMs, distanceKm),
    [elapsedMs, distanceKm]
  );
  const polylinePositions = useMemo(
    () => path.map((p) => [p.lat, p.lng]),
    [path]
  );


  const stopTracking = () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const onFinish = () => {
    setIsPaused(true);
    stopTracking();
    setMode("summary");
  };

  // ---- SUMMARY UI (giữ y nguyên logic trước, rút gọn để tập trung modal yêu cầu) ----
  if (mode === "summary") {
    const calories = Math.max(0, Math.round(distanceKm * 60));
    const title = completed ? "Great Run!" : "Nice Try!";
    const subtitle = completed
      ? "You crushed it today"
      : "Keep trying! You’ll do better next time.";

    return (
      <div className="min-h-screen bg-[#f3f1ee]">
        <style>{`
          .leaflet-container img { max-width: none !important; }
          .leaflet-container .leaflet-tile { max-width: none !important; max-height: none !important; }
          .leaflet-container { width: 100%; height: 100%; }
          .leaflet-control-attribution { display: none !important; }
        `}</style>

        <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6">
          <div className="rounded-3xl bg-[#aeead0] px-5 py-6 text-center shadow-sm">
            <div className="text-4xl">🎉</div>
            <div className="mt-2 text-2xl font-extrabold text-black">
              {title}
            </div>
            <div className="mt-1 text-sm font-semibold text-black/70">
              {subtitle}
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/10">
            <div className="h-[220px] w-full">
              <MapContainer
                center={center}
                zoom={15}
                className="h-full w-full"
                zoomControl={false}
              >
                <MapAutoFix center={center} path={path} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {pos && <Marker position={[pos.lat, pos.lng]} />}
                {path.length >= 2 && (
                  <Polyline
                    positions={polylinePositions}
                    pathOptions={{ color: "#22c55e", weight: 7, opacity: 0.95 }}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatCard
              icon="⚡"
              title="Pace"
              value={paceText.replace("/km", "")}
              suffix="/km"
              tone="green"
            />
            <StatCard
              icon="📍"
              title="Distance"
              value={distanceKm.toFixed(0)}
              suffix="km"
              tone="slate"
            />
            <StatCard
              icon="🕒"
              title="Time"
              value={formatTime(elapsedMs)}
              suffix=""
              tone="slate"
            />
            <StatCard
              icon="❤"
              title="Avg HR"
              value={`${avgHr}`}
              suffix="bpm"
              tone="rose"
            />
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 to-orange-600 p-5 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white/90">
                  Calories Burned
                </div>
                <div className="mt-1 text-3xl font-extrabold">
                  {calories} kcal
                </div>
              </div>
              <div className="text-4xl">🔥</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-2xl bg-white px-4 py-4 text-base font-extrabold text-black shadow-sm ring-1 ring-black/15 active:scale-[0.99]"
            >
              New Run
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTE_PATH.HOME)}
              className="rounded-2xl bg-[#aeead0] px-4 py-4 text-base font-extrabold text-black shadow-sm ring-1 ring-black/10 active:scale-[0.99]"
            >
              Save &amp; Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- RUNNING UI ----
  return (
    <div className="min-h-screen bg-[#0b1220]">
      <style>{`
        .leaflet-container img { max-width: none !important; }
        .leaflet-container .leaflet-tile { max-width: none !important; max-height: none !important; }
        .leaflet-container { width: 100%; height: 100%; }
        .leaflet-control-attribution { display: none !important; }
      `}</style>

      {/* ✅ Non-blocking toast modal */}
      <CongratsToast
        open={showCongrats}
        title="Congratulations!"
        desc="You’ve completed today’s challenge."
        onClose={() => setShowCongrats(false)}
      />

      {/* MAP */}
      <div className="relative h-[68vh] w-full overflow-hidden">
        <div className="absolute left-0 top-0 z-[1100] w-full px-4 pt-4">
          <div className="mx-auto flex w-full max-w-[460px] items-center justify-between">
            <div className="rounded-2xl bg-black/40 px-4 py-2 backdrop-blur-md ring-1 ring-white/15">
              <div className="text-base font-semibold text-white">
                Outdoor Run
              </div>
              <div className="mt-0.5 text-[11px] font-semibold text-white/70">
                {pos ? (
                  <>
                    Accuracy {Math.round(pos.accuracy)}m •{" "}
                    <span
                      className={
                        isPaused ? "text-amber-200" : "text-emerald-200"
                      }
                    >
                      {isPaused ? "Paused" : "Tracking"}
                    </span>
                  </>
                ) : (
                  "Getting your location…"
                )}
              </div>
            </div>

            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-2xl bg-black/40 text-xl text-white backdrop-blur-md ring-1 ring-white/15 active:scale-[0.98]"
              onClick={() => window.history.back()}
              aria-label="Close"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        <MapContainer
          center={center}
          zoom={16}
          className="h-full w-full"
          zoomControl={false}
        >
          <MapAutoFix center={center} path={path} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <RecenterButton center={center} />
          {pos && <Marker position={[pos.lat, pos.lng]} />}
          {path.length >= 2 && (
            <Polyline
              positions={polylinePositions}
              pathOptions={{ color: "#22c55e", weight: 7, opacity: 0.95 }}
            />
          )}
        </MapContainer>
      </div>

      {/* BOTTOM SHEET */}
      <div className="-mt-10 rounded-t-[34px] bg-[#f7f7fb] px-4 pb-10 pt-5 shadow-[0_-20px_60px_rgba(0,0,0,0.35)]">
        <div className="mx-auto w-full max-w-[460px]">
          <div className="mx-auto h-1.5 w-14 rounded-full bg-black/15" />

          <div className="mt-5 grid grid-cols-2 gap-3">
            <DistanceGoalCard distanceKm={distanceKm} targetKm={targetKm} />
            <TimeCard elapsedMs={elapsedMs} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatCard
              icon="⚡"
              title="Pace"
              value={paceText.replace("/km", "")}
              suffix="/km"
              tone="green"
            />
            <StatCard
              icon="❤"
              title="Avg HR"
              value={`${avgHr}`}
              suffix="bpm"
              tone="rose"
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsPaused((v) => !v)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-lg font-extrabold ring-1 ring-black/10 shadow-sm active:scale-[0.99]"
            >
              <span
                className={[
                  "inline-flex h-8 w-8 items-center justify-center rounded-xl",
                  isPaused
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700",
                ].join(" ")}
              >
                {isPaused ? "▶" : "⏸"}
              </span>
              {isPaused ? "Resume" : "Pause"}
            </button>

            <button
              type="button"
              onClick={onFinish}
              className="relative overflow-hidden rounded-2xl bg-[#111827] px-4 py-4 text-lg font-extrabold text-white shadow-sm ring-1 ring-black/15 active:scale-[0.99]"
            >
              <span className="relative z-10">Finish</span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500/35 via-sky-500/25 to-transparent" />
            </button>
          </div>

          <div className="mt-4 text-center text-xs font-semibold text-black/45">
            Tip: bấm ⦿ để đưa bản đồ về vị trí hiện tại
          </div>
        </div>
      </div>
    </div>
  );
}
