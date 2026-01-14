const mongoose = require('mongoose');


const AiMessageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, index: true },
    sender: { type: String, enum: ['ai_bot', 'user'], required: true, index: true },
    sentAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);



module.exports = mongoose.model('AiMessage', AiMessageSchema);
