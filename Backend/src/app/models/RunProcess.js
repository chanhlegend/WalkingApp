const mongoose = require('mongoose');


const RunProcessSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true, index: true },
    startedAt: { type: Date, required: true, index: true },
    endedAt: { type: Date },
// ở đây với giá trị pace thì mình nên làm khi hiển thị trong webapp là dạng real time còn khi lưu thì lấy tổng số thời gian chia cho số km
    avg_pace: { type: Number, min: 0 },
    distance: { type: Number, min: 0 },
    timeElapsed: { type: Number, min: 0 },
    avg_heartRate: { type: Number, min: 0 },

    caloriesBurned: { type: Number, min: 0 },

    status: {
      type: String,
      enum: ['recording', 'paused', 'finished', 'canceled'],
      default: 'recording',
      index: true,
    },

   
  },

  { timestamps: true }


);


module.exports = mongoose.model('RunProcess', RunProcessSchema);
