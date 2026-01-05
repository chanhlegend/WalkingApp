const mongoose = require('mongoose');


const NotificationSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId('User'),
    type: { type: String, required: true, index: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    sentAt: { type: Date, default: Date.now, index: true },
    readAt: { type: Date },
  },
  
);



module.exports = mongoose.model('Notification', NotificationSchema);
