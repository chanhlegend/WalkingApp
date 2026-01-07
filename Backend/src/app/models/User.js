const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
	{
		email: { type: String, unique: true },
		googleId: { type: String, index: true , unique: true, sparse: true },
		fullName: { type: String, default: '' },
		passWorldHash: { type: String, default: null },
		avatarUrl: String,
		role: { type: String, default: 'USER' },
		gender: { type: String, enum: ['male', 'female', 'other'] },
		tall : Number,
		weight: Number,
		active: { type: Boolean, default: true },
		onboardingCompleted: { type: Boolean, default: false },
		

		experiencePoints: { type: String },
		regularity: { type: String },
		goal: { type: String },
		trainingRunning : { type: String, },



		// khu vực setting notification 

		notificationSettings: {
			
			
			All: { type: Boolean, default: true },
			reminder : { type: Boolean, default: true },
			goalProgress : { type: Boolean, default: true },
			achievement : { type: Boolean, default: true },
		},
	    
	},
	{timestamps: true }
);


module.exports = mongoose.model('User', UserSchema);

