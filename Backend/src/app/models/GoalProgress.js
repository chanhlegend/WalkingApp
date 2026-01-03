const mongoose = require('mongoose');
const { withBaseSchemaOptions, objectIdRef } = require('./_shared');

const GoalProgressSchema = new mongoose.Schema(
  {
    goalId: objectIdRef('Goal'),
    periodStart: { type: Date, required: true, index: true },
    periodEnd: { type: Date },
    progressValue: { type: Number, default: 0, min: 0 },
    completed: { type: Boolean, default: false, index: true },
    completedAt: { type: Date },
    updatedAt: { type: Date },
  },
  withBaseSchemaOptions({ collection: 'goal_progress' })
);

GoalProgressSchema.index({ goalId: 1, periodStart: 1 }, { unique: true });
GoalProgressSchema.index({ completed: 1, updatedAt: -1 });

module.exports = mongoose.model('GoalProgress', GoalProgressSchema);
