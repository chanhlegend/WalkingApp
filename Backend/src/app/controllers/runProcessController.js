const RunProcess = require("../models/RunProcess");

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
};

module.exports = RunProcessController;
