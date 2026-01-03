const mongoose = require('mongoose');
const { withBaseSchemaOptions, objectIdRef } = require('./_shared');

const RunAggregateSchema = new mongoose.Schema(
  {
    userId: objectIdRef('User'),
    periodType: {
      type: String,
      required: true,
      enum: ['day', 'week', 'month'],
      index: true,
    },
    periodStart: { type: Date, required: true, index: true },

    totalDistanceM: { type: Number, default: 0, min: 0 },
    totalDurationS: { type: Number, default: 0, min: 0 },
    runCount: { type: Number, default: 0, min: 0 },
    avgHeartRate: { type: Number, min: 0 },
  },
  withBaseSchemaOptions({ collection: 'run_aggregates' })
);

RunAggregateSchema.index(
  { userId: 1, periodType: 1, periodStart: 1 },
  { unique: true }
);

module.exports = mongoose.model('RunAggregate', RunAggregateSchema);
