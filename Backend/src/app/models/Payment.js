const mongoose = require('mongoose');
const { withBaseSchemaOptions, objectIdRef } = require('./_shared');

const PaymentSchema = new mongoose.Schema(
  {
    userId: objectIdRef('User'),
    subscriptionId: objectIdRef('Subscription', false),

    amountVnd: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'VND' },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'succeeded', 'failed', 'canceled', 'refunded'],
      index: true,
    },

    provider: { type: String, default: 'payos', index: true },
    providerPaymentId: { type: String },

    // PayOS practical fields
    orderCode: { type: String },
    checkoutUrl: { type: String },
    paymentLinkId: { type: String },
    webhookPayload: { type: mongoose.Schema.Types.Mixed },
  },
  withBaseSchemaOptions({ collection: 'payments' })
);

PaymentSchema.index({ provider: 1, providerPaymentId: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ provider: 1, orderCode: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);
