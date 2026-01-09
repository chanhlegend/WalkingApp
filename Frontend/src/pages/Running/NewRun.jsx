import React from "react";
import ROUTE_PATH from "../../constants/routePath";
import { useNavigate } from "react-router-dom";

const NewRun = () => {
  const recentRuns = [
    { distance: "5.2 km", time: "32:15", ago: "2 days ago", pace: "6:12 /km" },
    { distance: "3.8 km", time: "24:30", ago: "4 days ago", pace: "6:26 /km" },
    { distance: "7.1 km", time: "45:20", ago: "6 days ago", pace: "6:23 /km" },
  ];

    const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="mx-auto w-full max-w-[420px] px-4 py-4">
        {/* Start New Run */}
        <button
          type="button"
          className="w-full rounded-2xl bg-[#AEEAD0] px-4 py-7 text-center shadow-sm active:scale-[0.99]"
          onClick={() => navigate(ROUTE_PATH.OUTDOOR_RUN)}
        >
          <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-black/10">
            <span className="text-xl leading-none">▶</span>
          </div>
          <div className="text-xl font-semibold text-black">Start New Run</div>
        </button>

        {/* This Week */}
        <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-black/80">
          <span className="text-lg">📅</span>
          <span>This Week</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {/* Total Distance */}
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-black/60">
              <span className="text-base">📈</span>
              <span>Total Distance</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-black">16.1 km</div>
            <div className="mt-2 text-sm font-medium text-emerald-600">
              +12% from last week
            </div>
          </div>

          {/* Total time */}
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-black/60">
              <span className="text-base">🕒</span>
              <span>Total time</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-black">1h 42m</div>
            <div className="mt-2 text-sm font-medium text-emerald-600">
              +8% from last week
            </div>
          </div>
        </div>

        {/* Recent Runs header */}
        <div className="mt-8 flex items-end justify-between">
          <h3 className="text-xl font-semibold text-black">Recent Runs</h3>
          <button
            type="button"
            className="text-sm font-medium text-black/50 hover:text-black/70"
          >
            See all
          </button>
        </div>

        {/* Recent Runs list */}
        <div className="mt-3 space-y-3">
          {recentRuns.map((run, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4 shadow-sm"
            >
              <div>
                <div className="text-base font-semibold text-black">
                  {run.distance}
                  <span className="ml-4 font-normal text-black/60">
                    {run.time}
                  </span>
                </div>
                <div className="mt-1 text-sm text-black/45">{run.ago}</div>
              </div>

              <div className="text-right">
                <div className="text-sm text-black/45">Pace</div>
                <div className="text-base font-semibold text-black">
                  {run.pace}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* bottom spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
};

export default NewRun;
