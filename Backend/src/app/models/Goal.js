const mongoose = require('mongoose');
const { withBaseSchemaOptions, objectIdRef } = require('./_shared');

const GoalSchema = new mongoose.Schema(
  {
    userId: objectIdRef('User'),
    goalType: {
      type: String,
      required: true,
      enum: ['distance', 'duration', 'frequency'],
      index: true,
    },
    targetValue: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    recurrence: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'one_off'],
      index: true,
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date },
    notifyOnCompletion: { type: Boolean, default: true },
    active: { type: Boolean, default: true, index: true },
  },
  withBaseSchemaOptions({ collection: 'goals' })
);

GoalSchema.index({ userId: 1, active: 1, startDate: -1 });

module.exports = mongoose.model('Goal', GoalSchema);
