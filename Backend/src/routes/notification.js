const notificationController = require("../app/controllers/notificationController");
const express = require("express");
const router = express.Router();

const requireAuth = require("../app/middlewares/requireAuth");

// Apply authentication middleware to all routes in this router
router.use(requireAuth);
// Route to create a new notification
router.post("/", notificationController.createNotification);
// Route to get notifications for a specific user
router.get("/user", notificationController.getUserNotifications);
// Route to mark a notification as read
router.patch("/:notificationId/read", notificationController.markAsRead);

router.patch("/user/read-all", notificationController.markAllAsRead);

module.exports = router;
