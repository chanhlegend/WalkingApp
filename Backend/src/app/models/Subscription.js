const mongoose = require('mongoose');
const { withBaseSchemaOptions, objectIdRef } = require('./_shared');

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: objectIdRef('User'),
    planId: objectIdRef('Plan'),
    status: {
      type: String,
      required: true,
      enum: ['active', 'past_due', 'canceled', 'incomplete'],
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    endsAt: { type: Date },
    provider: { type: String, default: 'payos' },
    providerSubscriptionId: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  withBaseSchemaOptions({ collection: 'subscriptions' })
);

SubscriptionSchema.index({ userId: 1, status: 1, endsAt: -1 });
SubscriptionSchema.index({ provider: 1, providerSubscriptionId: 1 }, { sparse: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
