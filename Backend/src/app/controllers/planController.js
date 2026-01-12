const Plan = require("../models/Plan");

/* ---------------- UTC Date helpers (khuyên dùng để tránh lệch ngày) ---------------- */

function startOfDayUTC(d) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}
function endOfDayUTC(d) {
  const x = new Date(d);
  x.setUTCHours(23, 59, 59, 999);
  return x;
}

// Monday 00:00 UTC
function startOfWeekMondayUTC(d) {
  const x = new Date(d);
  const day = x.getUTCDay(); // 0=Sun,1=Mon,...6=Sat
  const diffToMon = day === 0 ? -6 : 1 - day;
  x.setUTCDate(x.getUTCDate() + diffToMon);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}
// Sunday 23:59:59.999 UTC
function endOfWeekSundayUTC(d) {
  const s = startOfWeekMondayUTC(d);
  const e = new Date(s);
  e.setUTCDate(e.getUTCDate() + 6);
  e.setUTCHours(23, 59, 59, 999);
  return e;
}

function startOfMonthUTC(d) {
  const x = new Date(d);
  x.setUTCDate(1);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}
function endOfMonthUTC(d) {
  const s = startOfMonthUTC(d);
  const e = new Date(s);
  e.setUTCMonth(e.getUTCMonth() + 1);
  e.setUTCDate(0); // last day of prev month
  e.setUTCHours(23, 59, 59, 999);
  return e;
}

function isValidNonNegativeNumber(n) {
  return Number.isFinite(n) && n >= 0;
}

/* ---------------- Range builder ---------------- */

function buildRangeUTC(interval, dateObj) {
  if (interval === "daily") {
    return {
      interval,
      name: "Daily running goal",
      startDate: startOfDayUTC(dateObj),
      endDate: endOfDayUTC(dateObj),
    };
  }
  if (interval === "weekly") {
    return {
      interval,
      name: "Weekly running goal",
      startDate: startOfWeekMondayUTC(dateObj),
      endDate: endOfWeekSundayUTC(dateObj),
    };
  }
  if (interval === "monthly") {
    return {
      interval,
      name: "Monthly running goal",
      startDate: startOfMonthUTC(dateObj),
      endDate: endOfMonthUTC(dateObj),
    };
  }
  throw new Error("Unsupported interval");
}

/* ---------------- Copy/Seed logic ---------------- */

// Tính startDate của kỳ trước
function previousPeriodStartUTC(interval, currentStartDate) {
  const prev = new Date(currentStartDate);

  if (interval === "daily") {
    prev.setUTCDate(prev.getUTCDate() - 1);
    prev.setUTCHours(0, 0, 0, 0);
    return prev;
  }

  if (interval === "weekly") {
    prev.setUTCDate(prev.getUTCDate() - 7);
    prev.setUTCHours(0, 0, 0, 0);
    return prev;
  }

  if (interval === "monthly") {
    prev.setUTCMonth(prev.getUTCMonth() - 1);
    prev.setUTCDate(1);
    prev.setUTCHours(0, 0, 0, 0);
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
 * - Tạo mới với startDate/endDate đúng của kỳ hiện tại
 */
async function getOrCreatePlanForInterval({ userId, interval, dateObj }) {
  const range = buildRangeUTC(interval, dateObj);

  // 1) đã có kỳ hiện tại?
  const existed = await Plan.findOne({
    userId,
    interval,
    startDate: range.startDate,
  });

  if (existed) return existed;

  // 2) ưu tiên copy từ kỳ trước
  const prevStart = previousPeriodStartUTC(interval, range.startDate);

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
        // copy "y chang" ở mức hợp lý
        name: template?.name || range.name,
        status: template?.status || "active",
        totalDistance,
        // endDate luôn theo kỳ hiện tại
        endDate: range.endDate,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return doc;
}

/* ---------------- Controller ---------------- */

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
        return res.status(400).json({
          message: "Km values are invalid",
          success: false,
        });
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

      const now = new Date();

      const dailyRange = {
        interval: "daily",
        name: "Daily running goal",
        startDate: startOfDayUTC(now),
        endDate: endOfDayUTC(now),
        totalDistance: dailyKm,
      };

      const weeklyRange = {
        interval: "weekly",
        name: "Weekly running goal",
        startDate: startOfWeekMondayUTC(now),
        endDate: endOfWeekSundayUTC(now),
        totalDistance: weeklyKm,
      };

      const monthlyRange = {
        interval: "monthly",
        name: "Monthly running goal",
        startDate: startOfMonthUTC(now),
        endDate: endOfMonthUTC(now),
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
      console.log(e);
      return res.status(500).json({
        message: "Internal server error",
        success: false,
      });
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
      const dateObj = dateStr ? new Date(dateStr) : new Date();

      if (Number.isNaN(dateObj.getTime())) {
        return res.status(400).json({ message: "Invalid date", success: false });
      }

      const [daily, weekly, monthly] = await Promise.all([
        getOrCreatePlanForInterval({ userId, interval: "daily", dateObj }),
        getOrCreatePlanForInterval({ userId, interval: "weekly", dateObj }),
        getOrCreatePlanForInterval({ userId, interval: "monthly", dateObj }),
      ]);

      return res.status(200).json({
        data: { daily, weekly, monthly },
        message: "Plans retrieved successfully",
        success: true,
      });
    } catch (e) {
      console.log(e);
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
      console.log(e);
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
      console.log(e);
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
      console.log(e);
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
      console.log(e);
      return res.status(500).json({ message: "Internal server error", success: false });
    }
  },
};

module.exports = PlanController;
