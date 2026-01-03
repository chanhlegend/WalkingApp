const mongoose = require('mongoose');
const { withBaseSchemaOptions, objectIdRef } = require('./_shared');

const AiUsageDailySchema = new mongoose.Schema(
  {
    userId: objectIdRef('User'),
    date: { type: Date, required: true, index: true },
    requests: { type: Number, default: 0, min: 0 },
    tokensIn: { type: Number, default: 0, min: 0 },
    tokensOut: { type: Number, default: 0, min: 0 },
    costVnd: { type: Number, default: 0, min: 0 },
  },
  withBaseSchemaOptions({ collection: 'ai_usage_daily' })
);

AiUsageDailySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AiUsageDaily', AiUsageDailySchema);
