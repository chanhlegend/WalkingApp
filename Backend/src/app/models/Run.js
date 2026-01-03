const mongoose = require('mongoose');
const { withBaseSchemaOptions, objectIdRef } = require('./_shared');

const RunSchema = new mongoose.Schema(
  {
    userId: objectIdRef('User'),
    startedAt: { type: Date, required: true, index: true },
    endedAt: { type: Date },

    distanceM: { type: Number, min: 0 },
    durationS: { type: Number, min: 0 },
    avgPaceSPerKm: { type: Number, min: 0 },

    avgHeartRate: { type: Number, min: 0 },
    maxHeartRate: { type: Number, min: 0 },
    calories: { type: Number, min: 0 },

    status: {
      type: String,
      enum: ['recording', 'paused', 'finished', 'canceled'],
      default: 'recording',
      index: true,
    },

    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  withBaseSchemaOptions({ collection: 'runs' })
);

RunSchema.index({ userId: 1, startedAt: -1 });

module.exports = mongoose.model('Run', RunSchema);
