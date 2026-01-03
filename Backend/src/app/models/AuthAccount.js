const mongoose = require('mongoose');
const { withBaseSchemaOptions, objectIdRef } = require('./_shared');

const AuthAccountSchema = new mongoose.Schema(
  {
    userId: objectIdRef('User'),
    provider: {
      type: String,
      required: true,
      enum: ['google'],
      index: true,
    },
    providerUserId: { type: String, required: true },
    accessToken: { type: String },
    refreshToken: { type: String },
    expiresAt: { type: Date },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  withBaseSchemaOptions({ collection: 'auth_accounts' })
);

AuthAccountSchema.index({ provider: 1, providerUserId: 1 }, { unique: true });
AuthAccountSchema.index({ userId: 1, provider: 1 });

module.exports = mongoose.model('AuthAccount', AuthAccountSchema);
