const Plan = require("../models/Plan");

/* ===================== Time helpers (Vietnam UTC+7) ===================== */
/**
 * Quy ước: mọi tính toán "ngày/tuần/tháng" theo VN (UTC+7).
 * Date trong JS lưu theo UTC internally, nhưng khi ta setHours(...) trên Date đã "VN-adjusted",
 * mốc thời gian lưu xuống DB sẽ tương ứng đúng boundary VN.
 */

// Convert một Date bất kỳ sang "Vietnam wall-clock Date"
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

// Week starts Monday 00:00 VN
function startOfWeekMondayVN(d) {
  const x = new Date(d);
  const day = x.getDay(); // 0=Sun,1=Mon,...6=Sat (theo "wall-clock" của x)
  const diffToMon = (day + 6) % 7; // Mon->0, Tue->1, ..., Sun->6
  x.setDate(x.getDate() - diffToMon);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Week ends Sunday 23:59:59.999 VN
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
  // sang đầu tháng sau 00:00 rồi trừ 1ms
  x.setMonth(x.getMonth() + 1, 1);
  x.setHours(0, 0, 0, 0);
  x.setMilliseconds(x.getMilliseconds() - 1);
  return x;
}

function isValidNonNegativeNumber(n) {
  return Number.isFinite(n) && n >= 0;
}

/* ===================== Range builder (VN) ===================== */

function buildRangeVN(interval, dateObj) {
  if (interval === "daily") {
    return {
      interval,
      name: "Daily running goal",
      startDate: startOfDayVN(dateObj),
      endDate: endOfDayVN(dateObj),
    };
  }
  if (interval === "weekly") {
    return {
      interval,
      name: "Weekly running goal",
      startDate: startOfWeekMondayVN(dateObj),
      endDate: endOfWeekSundayVN(dateObj),
    };
  }
  if (interval === "monthly") {
    return {
      interval,
      name: "Monthly running goal",
      startDate: startOfMonthVN(dateObj),
      endDate: endOfMonthVN(dateObj),
    };
  }
  throw new Error("Unsupported interval");
}

/* ===================== Copy/Seed logic (VN) ===================== */

// Tính startDate của kỳ trước theo VN boundary
function previousPeriodStartVN(interval, currentStartDate) {
  const prev = new Date(currentStartDate);

  if (interval === "daily") {
    prev.setDate(prev.getDate() - 1);
    prev.setHours(0, 0, 0, 0);
    return prev;
  }

  if (interval === "weekly") {
    prev.setDate(prev.getDate() - 7);
    prev.setHours(0, 0, 0, 0);
    return prev;
  }

  if (interval === "monthly") {
    prev.setMonth(prev.getMonth() - 1);
    prev.setDate(1);
    prev.setHours(0, 0, 0, 0);
    return prev;
  }

  throw new Error("Unsupported interval");
}

// Fallback: lấy plan gần nhất theo startDate (ưu tiên quá khứ, không có thì lấy tương lai)
async function getNearestPlanDoc({ userId, interval, targetStartDate }) {
  const prev = await Plan.findOne({
    userId,
    interval,
    startDate: { $lte: targetStartDate },
  })
    .sort({ startDate: -1 })
    .lean();

  if (prev) return prev;

  const next = await Plan.findOne({
    userId,
    interval,
    startDate: { $gte: targetStartDate },
  })
    .sort({ startDate: 1 })
    .lean();

  return next || null;
}

/**
 * Yêu cầu:
 * - Nếu kỳ hiện tại đã có -> return
 * - Nếu chưa có:
 *   + ưu tiên copy "y chang" từ kỳ trước (daily: hôm qua, weekly: tuần trước, monthly: tháng trước)
 *   + nếu kỳ trước không tồn tại -> fallback nearest
 *   + không có gì -> totalDistance=0
 * - Tạo mới với startDate/endDate đúng của kỳ hiện tại (theo VN)
 */
async function getOrCreatePlanForInterval({ userId, interval, dateObj }) {
  const range = buildRangeVN(interval, dateObj);

  // 1) đã có kỳ hiện tại?
  const existed = await Plan.findOne({
    userId,
    interval,
    startDate: range.startDate,
  });

  if (existed) return existed;

  // 2) ưu tiên copy từ kỳ trước
  const prevStart = previousPeriodStartVN(interval, range.startDate);

  let template = await Plan.findOne({
    userId,
    interval,
    startDate: prevStart,
  }).lean();

  // 3) nếu kỳ trước không có -> fallback nearest
  if (!template) {
    template = await getNearestPlanDoc({
      userId,
      interval,
      targetStartDate: range.startDate,
    });
  }

  const totalDistance = template?.totalDistance ?? 0;

  // 4) upsert tạo kỳ hiện tại (tránh trùng unique index)
  const doc = await Plan.findOneAndUpdate(
    { userId, interval, startDate: range.startDate },
    {
      $setOnInsert: {
        userId,
        interval,
        startDate: range.startDate,
      },
      $set: {
        name: template?.name || range.name,
        status: template?.status || "active",
        totalDistance,
        endDate: range.endDate,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return doc;
}

/* ===================== Controller ===================== */

const PlanController = {
  // POST /plans/goal-settings
  async upsertGoalSettings(req, res) {
    try {
      const userId = req.user.id;

      const dailyKm = Number(req.body.dailyKm);
      const weeklyKm = Number(req.body.weeklyKm);
      const monthlyKm = Number(req.body.monthlyKm);

      if (
        !isValidNonNegativeNumber(dailyKm) ||
        !isValidNonNegativeNumber(weeklyKm) ||
        !isValidNonNegativeNumber(monthlyKm)
      ) {
        return res.status(400).json({ message: "Km values are invalid", success: false });
      }

      // Rule: weekly >= daily, monthly >= weekly
      if (weeklyKm < dailyKm) {
        return res.status(400).json({
          message: "Weekly distance cannot be less than daily distance",
          success: false,
        });
      }
      if (monthlyKm < weeklyKm) {
        return res.status(400).json({
          message: "Monthly distance cannot be less than weekly distance",
          success: false,
        });
      }

      // ✅ now theo giờ VN
      const vnNow = toVietnamDate(new Date());

      const dailyRange = {
        interval: "daily",
        name: "Daily running goal",
        startDate: startOfDayVN(vnNow),
        endDate: endOfDayVN(vnNow),
        totalDistance: dailyKm,
      };

      const weeklyRange = {
        interval: "weekly",
        name: "Weekly running goal",
        startDate: startOfWeekMondayVN(vnNow),
        endDate: endOfWeekSundayVN(vnNow),
        totalDistance: weeklyKm,
      };

      const monthlyRange = {
        interval: "monthly",
        name: "Monthly running goal",
        startDate: startOfMonthVN(vnNow),
        endDate: endOfMonthVN(vnNow),
        totalDistance: monthlyKm,
      };

      const dailyDoc = await Plan.findOneAndUpdate(
        { userId, interval: dailyRange.interval, startDate: dailyRange.startDate },
        {
          $set: {
            name: dailyRange.name,
            endDate: dailyRange.endDate,
            totalDistance: dailyRange.totalDistance,
            status: "active",
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      const weeklyDoc = await Plan.findOneAndUpdate(
        { userId, interval: weeklyRange.interval, startDate: weeklyRange.startDate },
        {
          $set: {
            name: weeklyRange.name,
            endDate: weeklyRange.endDate,
            totalDistance: weeklyRange.totalDistance,
            status: "active",
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      const monthlyDoc = await Plan.findOneAndUpdate(
        { userId, interval: monthlyRange.interval, startDate: monthlyRange.startDate },
        {
          $set: {
            name: monthlyRange.name,
            endDate: monthlyRange.endDate,
            totalDistance: monthlyRange.totalDistance,
            status: "active",
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      return res.status(200).json({
        data: { daily: dailyDoc, weekly: weeklyDoc, monthly: monthlyDoc },
        message: "Goal settings saved successfully",
        success: true,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Internal server error", success: false });
    }
  },

  /**
   * GET /plans/by-date?date=2025-12-01
   * - Nếu thiếu daily/weekly/monthly của kỳ hiện tại -> tự tạo và copy từ kỳ trước
   */
  async getPlansByDate(req, res) {
    try {
      const userId = req.user.id;
      const dateStr = req.query.date || req.body?.currentDate;

      // ✅ parse input -> rồi quy về VN wall-clock
      const base = dateStr ? new Date(dateStr) : new Date();
      const vnDate = toVietnamDate(base);

      if (Number.isNaN(vnDate.getTime())) {
        return res.status(400).json({ message: "Invalid date", success: false });
      }

      const [daily, weekly, monthly] = await Promise.all([
        getOrCreatePlanForInterval({ userId, interval: "daily", dateObj: vnDate }),
        getOrCreatePlanForInterval({ userId, interval: "weekly", dateObj: vnDate }),
        getOrCreatePlanForInterval({ userId, interval: "monthly", dateObj: vnDate }),
      ]);

      return res.status(200).json({
        data: { daily, weekly, monthly },
        message: "Plans retrieved successfully",
        success: true,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Internal server error", success: false });
    }
  },

  // POST /plans
  async createPlan(req, res) {
    try {
      const { name, interval, startDate, endDate, totalDistance } = req.body;
      const userId = req.user.id;

      const newPlan = new Plan({
        userId,
        name,
        interval,
        startDate,
        endDate,
        totalDistance,
      });

      await newPlan.save();

      return res.status(201).json({
        data: newPlan,
        message: "Plan created successfully",
        success: true,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Internal server error", success: false });
    }
  },

  // GET /plans
  async getPlans(req, res) {
    try {
      const userId = req.user.id;
      const plans = await Plan.find({ userId }).sort({ startDate: -1 });

      return res.status(200).json({
        data: plans,
        message: "Plans retrieved successfully",
        success: true,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Internal server error", success: false });
    }
  },

  // PATCH /plans/:id
  async updatePlan(req, res) {
    try {
      const planId = req.params.id;
      const updates = req.body;

      const plan = await Plan.findOneAndUpdate(
        { _id: planId, userId: req.user.id },
        updates,
        { new: true }
      );

      if (!plan) {
        return res.status(404).json({ message: "Plan not found", success: false });
      }

      return res.status(200).json({
        data: plan,
        message: "Plan updated successfully",
        success: true,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Internal server error", success: false });
    }
  },

  // DELETE /plans/:id
  async deletePlan(req, res) {
    try {
      const planId = req.params.id;

      const plan = await Plan.findOneAndDelete({
        _id: planId,
        userId: req.user.id,
      });

      if (!plan) {
        return res.status(404).json({ message: "Plan not found", success: false });
      }

      return res.status(200).json({
        message: "Plan deleted successfully",
        success: true,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Internal server error", success: false });
    }
  },
};

module.exports = PlanController;
