import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiBookmark } from "react-icons/fi";

import planService from "../../services/planService";
import runProcessService from "../../services/runProcessService";
import ROUTE_PATH from "../../constants/routePath";

import { PayOSService } from "../../services/payosService";
import QRCode from "qrcode";
import { toast } from "react-hot-toast";

import packageService from "../../services/packageService";
import "./Home.css";

const safeSrc = (v) => (typeof v === "string" && v.trim() ? v : null);

function isPackageActive(pkg) {
  if (!pkg) return false;
  if (pkg.status !== "valid") return false;
  const now = new Date();
  const start = pkg.startedAt ? new Date(pkg.startedAt) : null;
  const end = pkg.endedAt ? new Date(pkg.endedAt) : null;
  if (!start || !end) return false;
  return now >= start && now <= end;
}

/** Payment QR Modal (only Cancel button, auto-check note) */
function PaymentQRModal({ open, onClose, loading, error, qrURL }) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <h2>📲 Pay via QR</h2>
        </div>

        <div className="modal-body" style={{ display: "grid", gap: 14 }}>
          <div className="premium-features">
            <div className="premium-price">299.000 VNĐ / 1 Month</div>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            {loading ? (
              <div className="text-center py-12 text-black/60">
                <div className="inline-block">
                  <div className="animate-spin h-8 w-8 border-4 border-black/20 border-t-black/60 rounded-full"></div>
                </div>
                <p className="mt-2">Generating QR code...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>{error}</p>
              </div>
            ) : (
              <img
                src={safeSrc(qrURL) ?? undefined}
                alt="QR Code"
                className="w-full rounded"
              />
            )}
          </div>

          <p className="modal-warning" style={{ margin: 0 }}>
            After completing the payment, please wait 10 seconds for the system
            to confirm.
          </p>
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const [range, setRange] = useState("this_week");
  const [goals, setGoals] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // premium states
  const [checkingPremium, setCheckingPremium] = useState(true);
  const [myPackage, setMyPackage] = useState(null);

  const isPremium = useMemo(() => isPackageActive(myPackage), [myPackage]);

  // upgrade/payment modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // QR payment
  const [qrUrl, setQrUrl] = useState(null);
  const [orderCode, setOrderCode] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [qrError, setQrError] = useState("");

  // auto-check controls
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const closedRef = useRef(false);

  // ========= Fetch premium status =========
  useEffect(() => {
    const fetchMyPackage = async () => {
      try {
        setCheckingPremium(true);
        const res = await packageService.getMyPackage?.();
        // nếu service bạn chưa đổi tên thì dùng tạm getAvailablePackages -> nhưng khuyến nghị đổi như mình đã nói
        const pkg = res?.data || res?.package || null;
        setMyPackage(pkg);
      } catch {
        setMyPackage(null);
      } finally {
        setCheckingPremium(false);
      }
    };

    fetchMyPackage();
  }, []);

  // ========= Fetch dashboard data =========
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const goalsResult = await planService.getPlansByDate(
        new Date().toISOString().split("T")[0]
      );
      setGoals(goalsResult.success && goalsResult.data ? goalsResult.data : null);

      const period = range === "this_week" ? "week" : "month";
      const statsResult = await runProcessService.getStatsOverview(period);
      setStats(statsResult.success && statsResult.data ? statsResult.data : null);

      setLoading(false);
    };

    fetchData();
  }, [range]);

  // ========= Create PayOS payment & generate QR when opening payment modal =========
  useEffect(() => {
    const fetchPayOSAndGenerateQR = async () => {
      setLoadingQR(true);
      setQrError("");
      setQrUrl(null);
      setOrderCode(null);

      try {
        const newOrderCode =
          (Date.now() % 10_000_000_000_000) + Math.floor(Math.random() * 10_000);

        const paymentData = {
          orderCode: newOrderCode,
          amount: 299000, // ✅ fixed price
          description: "Premium 1 month", // <= 25 chars
          returnUrl: window.location.origin + "/payment-success",
          cancelUrl: window.location.origin + "/payment-cancel",
        };

        const result = await PayOSService.createPayment(paymentData);
        if (closedRef.current) return;

        setOrderCode(newOrderCode);

        const code =
          result?.qrCode ||
          result?.data?.qrCode ||
          result?.checkoutUrl ||
          result?.data?.checkoutUrl;

        if (typeof code === "string" && code.trim()) {
          const img = code.startsWith("data:image")
            ? code
            : await QRCode.toDataURL(code, { width: 260, margin: 2 });

          if (closedRef.current) return;
          setQrUrl(img);
        } else {
          setQrError("QR code is invalid from server.");
          console.error("No qrCode/checkoutUrl:", result);
        }
      } catch (error) {
        setQrError(error?.message || "Failed to create payment.");
        console.error("Error creating payment or generating QR:", error);
      } finally {
        setLoadingQR(false);
      }
    };

    if (showPaymentModal) {
      closedRef.current = false;
      fetchPayOSAndGenerateQR();
    } else {
      closedRef.current = true;
    }
  }, [showPaymentModal]);

  // ========= Verify payment (one-shot) =========
  const verifyOnce = async () => {
    if (!orderCode) return false;

    try {
      const response = await PayOSService.verifyPayment(orderCode);
      const status = response?.status || response?.data?.status;

      if (status === "PAID") {
        // ✅ create premium package in BE
        const sub = await packageService.subscribePackage();
        if (!sub?.success) {
          toast.error(sub?.message || "Payment paid but failed to activate premium.");
          return true; // stop checking anyway
        }

        toast.success("Premium activated successfully!");

        setShowPaymentModal(false);

        // delay 5s rồi reload
        setTimeout(() => {
          window.location.reload();
        }, 2000);

        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  // ========= Auto check every 5s ONLY after QR is rendered =========
  useEffect(() => {
    const clearTimers = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    if (!showPaymentModal) {
      clearTimers();
      return;
    }

    const qrReady = !!safeSrc(qrUrl) && !loadingQR && !qrError && !!orderCode;
    if (!qrReady) {
      clearTimers();
      return;
    }

    if (intervalRef.current || timeoutRef.current) return;

    // wait 10s, then start verify each 5s
    timeoutRef.current = setTimeout(() => {
      if (!showPaymentModal) return;

      verifyOnce();

      intervalRef.current = setInterval(() => {
        if (!showPaymentModal) return;
        verifyOnce();
      }, 5000);
    }, 10000);

    return () => clearTimers();
  }, [showPaymentModal, qrUrl, loadingQR, qrError, orderCode]);

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  return (
    <div className="home-container">
      {/* Premium Banner (if premium) */}
      {!checkingPremium && isPremium && (
        <section
          className="home-card "
          style={{
            border: "1px solid rgba(255,215,0,0.35)",
            background:
              "linear-gradient(135deg, rgba(255,215,0,0.25), rgba(255,255,255,0.95))",
            boxShadow: "0 4px 12px rgba(255,215,0,0.2)",
            color: "rgba(0,0,0,0.85)",
            padding: "16px 20px",
            marginBottom: 24,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-black text-[16px] mb-1">
                ⭐ Premium Active
              </div>
              <div className="text-black/70 text-[13px] leading-[1.4]">
                You are enjoying Premium benefits. Thank you for supporting WalkingApp!
              </div>
              <div className="text-black/60 text-[12px] mt-2">
                Expires:{" "}
                <b>{myPackage?.endedAt ? new Date(myPackage.endedAt).toLocaleString() : "—"}</b>
              </div>
            </div>
            <span
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                fontWeight: 800,
                fontSize: 12,
                background: "rgba(255,215,0,0.35)",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              PREMIUM
            </span>
          </div>
        </section>
      )}

      {/* Quick overview */}
      <section className="home-card quick-overview-card">
        <div className="flex items-center justify-between gap-2.5 mb-3">
          <div className="font-extrabold text-[14px]">
            Quick overview {isPremium ? "• Premium" : ""}
          </div>

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

      {/* Upgrade Premium (ONLY if NOT premium) */}
      {!checkingPremium && !isPremium && (
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
      )}

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
                <div className="premium-price">299.000 VNĐ / 1 Month</div>
                <div className="premium-features-list">
                  <div className="feature-item">Unlimited AI Health Consulting</div>
                  <div className="feature-item">Advanced Analytics & Insights</div>
                  <div className="feature-item">Personalized Training Plans</div>
                  <div className="feature-item">Priority Support 24/7</div>
                  <div className="feature-item">Ad-free Experience</div>
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
                  setShowUpgradeModal(false);
                  setShowPaymentModal(true);
                }}
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment QR Modal */}
      <PaymentQRModal
        open={showPaymentModal}
        onClose={handleClosePaymentModal}
        loading={loadingQR}
        error={qrError}
        qrURL={qrUrl}
      />
    </div>
  );
}
