const mongoose = require('mongoose');

const EmailOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    purpose: { type: String, enum: ['signup', 'login'], required: true, index: true },

    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date, default: null },

    // For signup flow: we only create the user after OTP verification.
    passwordHashForSignup: { type: String, default: null },
  },
  { timestamps: true }
);

EmailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('EmailOtp', EmailOtpSchema);
