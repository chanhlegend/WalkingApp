const mongoose = require('mongoose');
const { withBaseSchemaOptions } = require('./_shared');

const UserSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			lowercase: true,
			trim: true,
			index: true,
			unique: true,
		},
		emailVerified: { type: Boolean, default: false },

		passwordHash: { type: String },
		displayName: { type: String, trim: true },
		avatarUrl: { type: String, trim: true },

		dob: { type: Date },
		gender: {
			type: String,
			enum: ['male', 'female', 'other', 'unknown'],
			default: 'unknown',
		},
		heightCm: { type: Number, min: 0 },
		weightKg: { type: Number, min: 0 },
		timezone: { type: String, default: 'Asia/Ho_Chi_Minh' },

		settings: { type: mongoose.Schema.Types.Mixed, default: {} },
	},
	withBaseSchemaOptions({ collection: 'users' })
);

UserSchema.virtual('bmi').get(function bmi() {
	if (!this.heightCm || !this.weightKg) return null;
	const heightM = this.heightCm / 100;
	if (!heightM) return null;
	return this.weightKg / (heightM * heightM);
});

module.exports = mongoose.model('User', UserSchema);

