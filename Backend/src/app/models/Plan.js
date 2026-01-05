const mongoose = require('mongoose');


const PlanSchema = new mongoose.Schema(
  {
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    name: { type: String, required: true, trim: true, unique: true },
    interval: { type: String, required: true, enum: ['weekly' , 'monthly' ,'yearly' ] },
    startDate : { type: Date, required: true, index: true },
    endDate : { type: Date, required: true, index: true },
    status : { type: String, enum: ['active' , 'completed', 'pending' ], default: 'active', index: true },
    totalDistance : { type: Number, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', PlanSchema);
