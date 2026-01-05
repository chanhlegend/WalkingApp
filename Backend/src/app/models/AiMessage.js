const mongoose = require('mongoose');


const NotificationSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId('User'),
    message: { type: String, required: true, index: true },
    sender: {type : String, enum : ['ai_bot' , 'user'], required: true, index: true },
    sentAt: { type: Date, default: Date.now, index: true, },
   
  },
  { timestamps: true }
);



module.exports = mongoose.model('Notification', NotificationSchema);
