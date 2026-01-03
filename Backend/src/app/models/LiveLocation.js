const mongoose = require('mongoose');
const { withBaseSchemaOptions, objectIdRef } = require('./_shared');

const LiveLocationSchema = new mongoose.Schema(
  {
    userId: objectIdRef('User'),
    runId: objectIdRef('Run', false),
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    accuracyM: { type: Number, min: 0 },
    timestamp: { type: Date, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  withBaseSchemaOptions({ collection: 'live_locations' })
);

// TTL: document will be removed when expiresAt < now
LiveLocationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
LiveLocationSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('LiveLocation', LiveLocationSchema);
