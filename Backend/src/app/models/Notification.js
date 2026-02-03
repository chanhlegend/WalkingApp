const mongoose = require("mongoose");
const moment = require("moment-timezone");

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["info", "warning", "error", "success"],
      index: true,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    sentAt: {
      type: Date,
      default: () => moment.tz("Asia/Ho_Chi_Minh").toDate(),
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false,
  },
);

module.exports = mongoose.model("Notification", NotificationSchema);
