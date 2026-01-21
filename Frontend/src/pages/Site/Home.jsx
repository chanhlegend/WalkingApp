import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiEdit2, FiBookmark } from "react-icons/fi";
import planService from "../../services/planService";
import runProcessService from "../../services/runProcessService";
import ROUTE_PATH from "../../constants/routePath";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [range, setRange] = useState("this_week");
  const [goals, setGoals] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch goals
      const goalsResult = await planService.getPlansByDate(new Date().toISOString().split('T')[0]);
      if (goalsResult.success && goalsResult.data) {
        setGoals(goalsResult.data);
      }

      // Fetch stats based on range
      const period = range === "this_week" ? "week" : "month";
      const statsResult = await runProcessService.getStatsOverview(period);
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }

      setLoading(false);
    };

    fetchData();
  }, [range]);

  return (
    <div className="home-container">
      {/* Quick overview */}
      <section className="home-card quick-overview-card">
        <div className="flex items-center justify-between gap-2.5 mb-3">
          <div className="font-extrabold text-[14px]">Quick overview</div>

          <button
            className="h-8 rounded-[10px] border border-black/15 bg-white/70 px-2.5 flex items-center gap-2 cursor-pointer hover:bg-white/90 transition-colors"
            type="button"
            onClick={() =>
              setRange((r) => (r === "this_week" ? "this_month" : "this_week"))
            }
          >
            <span className="text-[13px] text-black">
              {range === "this_week" ? "This week" : "This month"}
            </span>
            <FiChevronDown />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 max-[380px]:gap-2 max-[380px]:grid-cols-1">
          <div className="stat-card">
            <div className="font-black text-[24px] tracking-[.01em] text-[var(--primary)]">
              {stats ? `${stats.totalDistance} KM` : "-- KM"}
            </div>
            <div className="text-black/60 text-[12px] mt-1.5">
              {range === "this_week" ? "This week" : "This month"}
            </div>
          </div>

          <div className="stat-card">
            <div className="font-black text-[24px] tracking-[.01em] text-[var(--primary)]">
              {stats ? `${stats.totalRuns} RUNS` : "-- RUNS"}
            </div>
            <div className="text-black/60 text-[12px] mt-1.5">Total</div>
          </div>

          <div className="stat-card">
            <div className="font-black text-[24px] tracking-[.01em] text-[var(--primary)]">
              {stats ? stats.totalTimeElapsed : "--:--"}
            </div>
            <div className="text-black/60 text-[12px] mt-1.5">Hours active</div>
          </div>
        </div>
      </section>

      {/* Update Premium */}
      <section className="home-card premium-card">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <div className="font-black text-[16px] mb-1">✨ Upgrade Premium</div>
            <div className="text-black/60 text-[13px] leading-[1.4]">
              Use our AI chat to get personalized health and fitness advice tailored to your goals.
            </div>
          </div>
          <button
            className="h-10 px-4 rounded-xl border border-transparent bg-[linear-gradient(135deg,#ffd700,#ffed4e)] font-bold text-[13px] cursor-pointer hover:opacity-90 transition-opacity shadow-sm flex-shrink-0 whitespace-nowrap"
            type="button"
            onClick={() => setShowUpgradeModal(true)}
          >
            Upgrade Now
          </button>
        </div>
      </section>

      {/* Program card */}
      <section className="home-card program-card">
        <div className="h-[120px] bg-gradient-to-br from-black/5 to-black/10 flex items-center justify-center rounded-t-xl">
          <div className="w-[104px] h-[104px] rounded-full bg-white/80 border border-black/15 flex flex-col items-center justify-center font-black text-[22px] shadow-sm">
            21K
            <div className="text-[10px] font-extrabold mt-1 tracking-[.02em]">
              HALF MARATHON
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between gap-2.5 items-start mb-3">
            <div>
              <div className="font-black text-[18px]">First Half Marathon</div>
              <div className="text-black/60 text-[12px] mt-1.5 leading-[1.4]">
                This 21.1 km workout is designed for runners building toward their first half marathon.
              </div>
            </div>

            <div className="h-7 px-3 rounded-[10px] border border-black/15 bg-white/70 text-[11px] font-bold flex items-center whitespace-nowrap flex-shrink-0">
              Beginners
            </div>
          </div>

          <button
            className="w-full h-11 rounded-xl border border-transparent bg-[var(--primary)] font-extrabold cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
            type="button"
            onClick={() => navigate(ROUTE_PATH.NEW_RUN)}
          >
            Start now
          </button>
        </div>
      </section>

      {/* Goals */}
      <section className="mt-6">
        <div className="flex items-center justify-between my-1 mx-0.5 mb-4">
          <div className="font-black text-[18px]">Your Goals</div>
          <button
            className="border-0 bg-transparent text-black/60 cursor-pointer font-semibold hover:text-black/90 transition-colors"
            type="button"
          >
            See all
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-black/60">
            <div className="inline-block">
              <div className="animate-spin h-8 w-8 border-4 border-black/20 border-t-black/60 rounded-full"></div>
            </div>
            <p className="mt-2">Loading goals...</p>
          </div>
        ) : goals ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
            {/* Daily Goal */}
            {goals.daily && (
              <div className="goal-card goal-card-daily">
                <div className="flex justify-between items-start mb-3">
                  <div className="h-7 px-3 rounded-full border border-black/15 bg-blue-50 text-[11px] font-black text-blue-600 flex items-center">
                    DAILY
                  </div>
                  <button
                    className="w-[32px] h-[32px] rounded-full border border-black/15 bg-white hover:bg-black/5 grid place-items-center cursor-pointer transition-colors"
                    type="button"
                    aria-label="Bookmark"
                  >
                    <FiBookmark className="w-4 h-4" />
                  </button>
                </div>
                <div className="font-black text-[15px] leading-[1.3] mb-2">
                  {goals.daily.name}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-[24px] font-black text-[var(--primary)]">
                    {goals.daily.totalDistance}
                  </div>
                  <div className="text-black/60 text-[12px]">KM</div>
                </div>
              </div>
            )}

            {/* Weekly Goal */}
            {goals.weekly && (
              <div className="goal-card goal-card-weekly">
                <div className="flex justify-between items-start mb-3">
                  <div className="h-7 px-3 rounded-full border border-black/15 bg-purple-50 text-[11px] font-black text-purple-600 flex items-center">
                    WEEKLY
                  </div>
                  <button
                    className="w-[32px] h-[32px] rounded-full border border-black/15 bg-white hover:bg-black/5 grid place-items-center cursor-pointer transition-colors"
                    type="button"
                    aria-label="Bookmark"
                  >
                    <FiBookmark className="w-4 h-4" />
                  </button>
                </div>
                <div className="font-black text-[15px] leading-[1.3] mb-2">
                  {goals.weekly.name}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-[24px] font-black text-[var(--primary)]">
                    {goals.weekly.totalDistance}
                  </div>
                  <div className="text-black/60 text-[12px]">KM</div>
                </div>
              </div>
            )}

            {/* Monthly Goal */}
            {goals.monthly && (
              <div className="goal-card goal-card-monthly">
                <div className="flex justify-between items-start mb-3">
                  <div className="h-7 px-3 rounded-full border border-black/15 bg-orange-50 text-[11px] font-black text-orange-600 flex items-center">
                    MONTHLY
                  </div>
                  <button
                    className="w-[32px] h-[32px] rounded-full border border-black/15 bg-white hover:bg-black/5 grid place-items-center cursor-pointer transition-colors"
                    type="button"
                    aria-label="Bookmark"
                  >
                    <FiBookmark className="w-4 h-4" />
                  </button>
                </div>
                <div className="font-black text-[15px] leading-[1.3] mb-2">
                  {goals.monthly.name}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-[24px] font-black text-[var(--primary)]">
                    {goals.monthly.totalDistance}
                  </div>
                  <div className="text-black/60 text-[12px]">KM</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-black/60">No goals found</div>
        )}
      </section>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2>🌟 Upgrade to Premium</h2>
            </div>
            <div className="modal-body">
              <div className="premium-features">
                <div className="premium-price">₩299,000 / 1 Month</div>
                <div className="premium-features-list">
                  <div className="feature-item">✓ Unlimited AI Health Consulting</div>
                  <div className="feature-item">✓ Advanced Analytics & Insights</div>
                  <div className="feature-item">✓ Personalized Training Plans</div>
                  <div className="feature-item">✓ Priority Support 24/7</div>
                  <div className="feature-item">✓ Ad-free Experience</div>
                </div>
              </div>
              <p className="modal-warning">Auto-renews monthly. Cancel anytime.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowUpgradeModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-btn modal-btn-upgrade"
                onClick={() => {
                  // TODO: Handle upgrade payment
                  setShowUpgradeModal(false);
                }}
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
