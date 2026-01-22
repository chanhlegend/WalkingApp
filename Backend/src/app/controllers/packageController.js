const Packge = require("../models/Packge");

/**
 * Helper: get "now" in Vietnam time as a Date object
 * (Date object = timestamp chuẩn, so sánh với MongoDB OK)
 */
const getNowVN = () => {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );
};

const PackageController = {
  // Tạo mới Package (Premium 1 month)
  createPackage: async (req, res) => {
    try {
      const userId = req.user.id;

      const nowVN = getNowVN();

      const payload = {
        status: "valid",
        startedAt: nowVN,
        endedAt: new Date(nowVN.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
        userId,
      };

      const newPackage = await Packge.create(payload);

      return res.status(201).json({
        message: "Package created successfully",
        package: newPackage,
        success: true,
      });
    } catch (error) {
      console.error("Error creating package:", error);
      return res.status(500).json({
        message: "Failed to create package",
        error: error?.message || "Unknown error",
        success: false,
      });
    }
  },

  // Lấy Package còn hạn theo userId (đúng giờ VN)
  getPackageByUserId: async (req, res) => {
    try {
      const userId = req.user.id;
      const nowVN = getNowVN();

      // Tìm gói còn hạn: startedAt <= now <= endedAt & status=valid
      const activePackage = await Packge.findOne({
        userId,
        status: "valid",
        startedAt: { $lte: nowVN },
        endedAt: { $gte: nowVN },
      }).sort({ endedAt: -1, createdAt: -1 });

      if (!activePackage) {
        return res.status(404).json({
          message: "No active package found for this user",
          package: null,
          success: false,
        });
      }

      return res.status(200).json({
        message: "Active package retrieved successfully",
        package: activePackage,
        success: true,
      });
    } catch (error) {
      console.error("Error retrieving package:", error);
      return res.status(500).json({
        message: "Failed to retrieve package",
        error: error?.message || "Unknown error",
        success: false,
      });
    }
  },
};

module.exports = PackageController;
