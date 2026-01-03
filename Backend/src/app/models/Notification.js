const mongoose = require('mongoose');
const { withBaseSchemaOptions, objectIdRef } = require('./_shared');

const NotificationSchema = new mongoose.Schema(
  {
    userId: objectIdRef('User'),
    type: { type: String, required: true, index: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    sentAt: { type: Date, default: Date.now, index: true },
    readAt: { type: Date },
  },
  withBaseSchemaOptions({ collection: 'notifications' })
);

NotificationSchema.index({ userId: 1, sentAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
