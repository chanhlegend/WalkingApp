const RunProcess = require("../models/RunProcess");
const Plan = require("../models/Plan");

/* ===================== Time helpers (Vietnam UTC+7) ===================== */
function toVietnamDate(date = new Date()) {
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utcTime + 7 * 60 * 60000);
}

function startOfDayVN(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDayVN(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfWeekMondayVN(d) {
  const x = new Date(d);
  const day = x.getDay();
  const diffToMon = (day + 6) % 7;
  x.setDate(x.getDate() - diffToMon);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfWeekSundayVN(d) {
  const s = startOfWeekMondayVN(d);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

function startOfMonthVN(d) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfMonthVN(d) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + 1, 1);
  x.setHours(0, 0, 0, 0);
  x.setMilliseconds(x.getMilliseconds() - 1);
  return x;
}

function startOfYearVN(d) {
  const x = new Date(d);
  x.setMonth(0, 1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfYearVN(d) {
  const x = new Date(d);
  x.setMonth(11, 31);
  x.setHours(23, 59, 59, 999);
  return x;
}

function toDateKeyVN(date) {
  const vn = toVietnamDate(date);
  const yyyy = vn.getFullYear();
  const mm = String(vn.getMonth() + 1).padStart(2, "0");
  const dd = String(vn.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatTimeHHMM(vnDate) {
  const hh = String(vnDate.getHours()).padStart(2, "0");
  const mm = String(vnDate.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const RunProcessController = {
  //Hàm tạo mới một RunProcess
  createRunProcess: async (req, res) => {
    try {
      const runProcessData = req.body;
        console.log("runProcessData", runProcessData);
        
      if (!runProcessData || typeof runProcessData !== "object") {
        return res.status(400).json({
          success: false,
          message: "Missing runProcessData",
        });
      }

      const userId = req.user._id;

      const {
        startedAt,
        avg_pace,
        distance,
        timeElapsed,
        avg_heartRate,
        caloriesBurned,
      } = runProcessData;

      // --- validate startedAt ---
      const startedAtDate = new Date(startedAt);
      if (!startedAt || Number.isNaN(startedAtDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid startedAt",
        });
      }

      // --- validate numbers ---
      const distNum = Number(distance);
      const timeNum = Number(timeElapsed);
      const hrNum = avg_heartRate == null ? undefined : Number(avg_heartRate);
      const calNum =
        caloriesBurned == null ? undefined : Number(caloriesBurned);
      const paceNum = avg_pace == null ? undefined : Number(avg_pace);

      if (!Number.isFinite(distNum) || distNum < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid distance",
        });
      }

      if (!Number.isFinite(timeNum) || timeNum < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid timeElapsed",
        });
      }

      if (hrNum != null && (!Number.isFinite(hrNum) || hrNum < 0)) {
        return res.status(400).json({
          success: false,
          message: "Invalid avg_heartRate",
        });
      }

      if (calNum != null && (!Number.isFinite(calNum) || calNum < 0)) {
        return res.status(400).json({
          success: false,
          message: "Invalid caloriesBurned",
        });
      }

      // --- compute avg_pace if missing or invalid ---
      // avg_pace = seconds per km (timeElapsed / distance)
      let finalAvgPace = paceNum;
      if (!Number.isFinite(finalAvgPace) || finalAvgPace < 0) {
        finalAvgPace = distNum > 0 ? timeNum / distNum : 0;
      }

      // (optional) clamp to avoid weird spikes (example)
      // finalAvgPace = Math.max(0, Math.min(finalAvgPace, 60 * 30)); // <= 30min/km

      const newRunProcess = new RunProcess({
        userId,
        startedAt: startedAtDate,
        avg_pace: finalAvgPace,
        distance: distNum,
        timeElapsed: timeNum,
        avg_heartRate: hrNum ?? 0,
        caloriesBurned: calNum ?? 0,
      });

      const savedRunProcess = await newRunProcess.save();

      return res.status(201).json({
        success: true,
        message: "Run process created successfully",
        data: savedRunProcess,
      });
    } catch (error) {
      console.error("Error creating run process:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // Hàm lấy các run process theo 1 ngày cụ thể
  getRunProcessesByDate: async (req, res) => {
    try {
      const { date } = req.query;
      const userId = req.user.id;
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      const runProcesses = await RunProcess.find({
        userId,
        startedAt: { $gte: startOfDay, $lte: endOfDay },
      }).sort({ startedAt: -1 });
      return res.status(200).json({
        success: true,
        message: "Run processes retrieved successfully",
        data: runProcesses,
      });
    } catch (error) {
      console.error("Error retrieving run processes by date:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // Hàm lấy tất cả RunProcess của người dùng hiện tại
  getRunProcesses: async (req, res) => {
    try {
      const userId = req.user._id;
      const runProcesses = await RunProcess.find({ userId }).sort({
        startedAt: -1,
      });
      return res.status(200).json({
        success: true,
        message: "Run processes retrieved successfully",
        data: runProcesses,
      });
    } catch (error) {
      console.error("Error retrieving run processes:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // Lấy một RunProcess theo ID
  getRunProcessById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const runProcess = await RunProcess.findOne({ _id: id, userId });
      if (!runProcess) {
        return res.status(404).json({
          success: false,
          message: "Run process not found",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Run process retrieved successfully",
        data: runProcess,
      });
    } catch (error) {
      console.error("Error retrieving run process:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // GET /run-processes/stats/overview?period=week
  // period: week, month
  getStatsOverview: async (req, res) => {
    try {
      const userId = req.user._id;
      const { period } = req.query;
      const vnNow = toVietnamDate(new Date());

      let startDate, endDate;

      if (period === "month") {
        startDate = startOfMonthVN(vnNow);
        endDate = endOfMonthVN(vnNow);
      } else {
        // default: week
        startDate = startOfWeekMondayVN(vnNow);
        endDate = endOfWeekSundayVN(vnNow);
      }

      const runProcesses = await RunProcess.find({
        userId,
        startedAt: { $gte: startDate, $lte: endDate },
      });

      // Calculate stats
      const stats = {
        totalDistance: 0,
        totalRuns: runProcesses.length,
        totalTimeElapsed: 0, // in seconds
      };

      runProcesses.forEach((run) => {
        stats.totalDistance += run.distance || 0;
        stats.totalTimeElapsed += run.timeElapsed || 0;
      });

      // Convert timeElapsed to HH:MM format
      const hours = Math.floor(stats.totalTimeElapsed / 3600);
      const minutes = Math.floor((stats.totalTimeElapsed % 3600) / 60);
      const timeFormatted = `${hours}H:${minutes}M`;

      return res.status(200).json({
        success: true,
        message: "Stats overview retrieved successfully",
        data: {
          period,
          totalDistance: stats.totalDistance.toFixed(2),
          totalRuns: stats.totalRuns,
          totalTimeElapsed: timeFormatted,
          startDate,
          endDate,
        },
      });
    } catch (error) {
      console.error("Error retrieving stats overview:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // GET /run-processes/stats/dashboard?range=today|week|month|year
  // Returns shape to match new frontend Statistics page
  getStatsDashboard: async (req, res) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const vnNow = toVietnamDate(new Date());
      const range = String(req.query.range || "week").toLowerCase();

      let startDate;
      let endDate;

      if (range === "today") {
        startDate = startOfDayVN(vnNow);
        endDate = endOfDayVN(vnNow);
      } else if (range === "month") {
        startDate = startOfMonthVN(vnNow);
        endDate = endOfMonthVN(vnNow);
      } else if (range === "year") {
        startDate = startOfYearVN(vnNow);
        endDate = endOfYearVN(vnNow);
      } else {
        // default: week
        startDate = startOfWeekMondayVN(vnNow);
        endDate = endOfWeekSundayVN(vnNow);
      }

      const runs = await RunProcess.find({
        userId,
        startedAt: { $gte: startDate, $lte: endDate },
      }).sort({ startedAt: -1 });

      const lastUpdatedAt = runs[0]?.startedAt ? new Date(runs[0].startedAt) : null;

      const totalDistanceKm = runs.reduce(
        (sum, r) => sum + (Number(r.distance) || 0),
        0
      );
      const totalTimeSeconds = runs.reduce(
        (sum, r) => sum + (Number(r.timeElapsed) || 0),
        0
      );

      const totalRuns = runs.length;
      const timeHours = totalTimeSeconds / 3600;

      // Pace: minutes per km (from totals to keep it stable)
      const paceMinPerKm =
        totalDistanceKm > 0 ? totalTimeSeconds / 60 / totalDistanceKm : 0;

      // Personal bests
      const longestKm = runs.reduce(
        (mx, r) => Math.max(mx, Number(r.distance) || 0),
        0
      );

      // Fastest pace among runs (minutes per km). Prefer avg_pace (seconds/km) if present, else time/distance.
      let fastestMinPerKm = null;
      for (const r of runs) {
        const dist = Number(r.distance) || 0;
        const t = Number(r.timeElapsed) || 0;
        if (dist <= 0 || t <= 0) continue;
        const secPerKm = Number(r.avg_pace);
        const candidate =
          Number.isFinite(secPerKm) && secPerKm > 0
            ? secPerKm / 60
            : t / 60 / dist;
        if (!Number.isFinite(candidate) || candidate <= 0) continue;
        if (fastestMinPerKm == null || candidate < fastestMinPerKm) {
          fastestMinPerKm = candidate;
        }
      }

      // Best week distance (compute within the selected range; for better UX also include weekly grouping)
      const weekBuckets = new Map();
      for (const r of runs) {
        const weekStart = startOfWeekMondayVN(toVietnamDate(r.startedAt));
        const key = weekStart.toISOString();
        const prev = weekBuckets.get(key) || 0;
        weekBuckets.set(key, prev + (Number(r.distance) || 0));
      }
      let bestWeekKm = 0;
      for (const v of weekBuckets.values()) bestWeekKm = Math.max(bestWeekKm, v);

      // Streak days: consecutive VN dates with at least one run, ending today
      const dateSet = new Set(runs.map((r) => toDateKeyVN(r.startedAt)));
      let streakDays = 0;
      for (let i = 0; i < 366; i++) {
        const d = new Date(vnNow);
        d.setDate(d.getDate() - i);
        const key = toDateKeyVN(d);
        if (dateSet.has(key)) streakDays += 1;
        else break;
      }

      // Active plan progress in the same VN "now" window
      const activePlan = await Plan.findOne({
        userId,
        status: "active",
        startDate: { $lte: vnNow },
        endDate: { $gte: vnNow },
      }).sort({ startDate: -1 });

      let planTarget = 0;
      let planProgress = 0;
      if (activePlan) {
        planTarget = Number(activePlan.totalDistance) || 0;
        const progressStart = activePlan.startDate;
        const progressEnd = vnNow < activePlan.endDate ? vnNow : activePlan.endDate;
        const planRuns = await RunProcess.find({
          userId,
          startedAt: { $gte: progressStart, $lte: progressEnd },
        });
        planProgress = planRuns.reduce(
          (sum, r) => sum + (Number(r.distance) || 0),
          0
        );
      }

      // Trend series for chart (distance + pace)
      // distance: km (sum per bucket)
      // pace: min/km (time/60/distance per bucket)
      const trend = [];
      if (range === "today") {
        const ascending = [...runs].reverse();
        for (const r of ascending) {
          const dist = Number(r.distance) || 0;
          const timeSec = Number(r.timeElapsed) || 0;
          const pace = dist > 0 ? timeSec / 60 / dist : 0;
          const vn = toVietnamDate(r.startedAt);
          trend.push({
            label: formatTimeHHMM(vn),
            distance: Number(dist.toFixed(2)),
            pace: Number(pace.toFixed(2)),
          });
        }
      } else if (range === "week") {
        const weekStart = startOfWeekMondayVN(vnNow);
        const buckets = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(weekStart);
          d.setDate(d.getDate() + i);
          const label = WEEKDAY_LABELS[d.getDay()];
          return { label, distanceSum: 0, timeSum: 0 };
        });

        for (const r of runs) {
          const vn = startOfDayVN(toVietnamDate(r.startedAt));
          const idx = Math.floor((vn.getTime() - weekStart.getTime()) / 86400000);
          if (idx < 0 || idx > 6) continue;
          buckets[idx].distanceSum += Number(r.distance) || 0;
          buckets[idx].timeSum += Number(r.timeElapsed) || 0;
        }

        for (const b of buckets) {
          const pace = b.distanceSum > 0 ? b.timeSum / 60 / b.distanceSum : 0;
          trend.push({
            label: b.label,
            distance: Number(b.distanceSum.toFixed(2)),
            pace: Number(pace.toFixed(2)),
          });
        }
      } else if (range === "month") {
        const monthStart = startOfMonthVN(vnNow);
        const monthEnd = endOfMonthVN(vnNow);
        const monthWeekStarts = new Map();

        for (const r of runs) {
          const vn = toVietnamDate(r.startedAt);
          const ws = startOfWeekMondayVN(vn);
          // keep buckets only if week overlaps the month
          const we = new Date(ws);
          we.setDate(we.getDate() + 6);
          if (we < monthStart || ws > monthEnd) continue;
          const key = ws.toISOString();
          if (!monthWeekStarts.has(key)) {
            monthWeekStarts.set(key, { start: ws, distanceSum: 0, timeSum: 0 });
          }
          const bucket = monthWeekStarts.get(key);
          bucket.distanceSum += Number(r.distance) || 0;
          bucket.timeSum += Number(r.timeElapsed) || 0;
        }

        const sorted = [...monthWeekStarts.values()].sort(
          (a, b) => a.start.getTime() - b.start.getTime()
        );

        sorted.forEach((b, i) => {
          const pace = b.distanceSum > 0 ? b.timeSum / 60 / b.distanceSum : 0;
          trend.push({
            label: `W${i + 1}`,
            distance: Number(b.distanceSum.toFixed(2)),
            pace: Number(pace.toFixed(2)),
          });
        });
      } else if (range === "year") {
        const buckets = Array.from({ length: 12 }).map((_, i) => ({
          label: MONTH_LABELS[i],
          distanceSum: 0,
          timeSum: 0,
        }));

        for (const r of runs) {
          const vn = toVietnamDate(r.startedAt);
          const m = vn.getMonth();
          buckets[m].distanceSum += Number(r.distance) || 0;
          buckets[m].timeSum += Number(r.timeElapsed) || 0;
        }

        for (const b of buckets) {
          const pace = b.distanceSum > 0 ? b.timeSum / 60 / b.distanceSum : 0;
          trend.push({
            label: b.label,
            distance: Number(b.distanceSum.toFixed(2)),
            pace: Number(pace.toFixed(2)),
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: "Stats dashboard retrieved successfully",
        data: {
          range,
          distance: Number(totalDistanceKm.toFixed(2)),
          runs: totalRuns,
          time: Number(timeHours.toFixed(2)),
          pace: Number(paceMinPerKm.toFixed(2)),
          lastUpdatedAt,
          trend,
          personalBests: {
            longest: Number(longestKm.toFixed(2)),
            fastest:
              fastestMinPerKm == null ? 0 : Number(fastestMinPerKm.toFixed(2)),
            bestWeek: Number(bestWeekKm.toFixed(2)),
            streak: streakDays,
          },
          planProgress: Number(planProgress.toFixed(2)),
          planTarget: Number(planTarget.toFixed(2)),
          startDate,
          endDate,
        },
      });
    } catch (error) {
      console.error("Error retrieving stats dashboard:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
};

module.exports = RunProcessController;
