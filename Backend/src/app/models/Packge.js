const mongoose = require('mongoose');


const PackgeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: [ 'valid', 'invalid'], required: true, index: true },
    startedAt: { type: Date, required: true, index: true },
    endedAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);



module.exports = mongoose.model('Packge', PackgeSchema);
