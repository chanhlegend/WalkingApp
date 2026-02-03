const Notification = require("../models/Notification");
const { emitToUser } = require("../socket");

const notificationController = {
  // Create a new notification
  createNotification: async (req, res) => {
    try {
      const dataNotification = req.body;
      const { title, type, message } = dataNotification;

      // req.user.id phải có từ middleware auth
      const userId = req.user.id;

      const newNotification = new Notification({
        userId,
        title,
        type,
        message,
      });

      const savedNotification = await newNotification.save();
      emitToUser(userId, "notification:new", savedNotification);

      return res.status(201).json({
        data: savedNotification,
        message: "Notification created successfully.",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        message: "Failed to create notification.",
        success: false,
      });
    }
  },

  // Get notifications for current user (newest -> oldest)
  getUserNotifications: async (req, res) => {
    try {
      const userId = req.user.id;

      const notifications = await Notification.find({ userId }).sort({
        sentAt: -1,
      });

      return res.status(200).json({
        data: notifications,
        message: "Notifications fetched successfully.",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        message: "Failed to fetch notifications.",
        success: false,
      });
    }
  },

  // Mark ONE notification as read (✅ thêm check userId để bảo mật)
  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const updatedNotification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true, readAt: new Date() },
        { new: true },
      );

      if (!updatedNotification) {
        return res.status(404).json({
          error: "Notification not found.",
          message: "Notification not found.",
          success: false,
        });
      }

      return res.status(200).json({
        data: updatedNotification,
        message: "Notification marked as read successfully.",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        message: "Failed to mark notification as read.",
        success: false,
      });
    }
  },

  // ✅ NEW: Mark ALL notifications as read for current user
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.id;

      await Notification.updateMany(
        { userId, isRead: false },
        { $set: { isRead: true, readAt: new Date() } },
      );

      // Trả về list mới nhất để FE sync lại
      const notifications = await Notification.find({ userId }).sort({
        sentAt: -1,
      });

      return res.status(200).json({
        data: notifications,
        message: "All notifications marked as read successfully.",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        message: "Failed to mark all notifications as read.",
        success: false,
      });
    }
  },
};

module.exports = notificationController;
