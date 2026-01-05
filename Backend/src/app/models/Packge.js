const mongoose = require('mongoose');


const PackgeSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId('User'),
    status: { type: String, ennum: [ 'valid', 'invalid'], required: true, index: true },
    startedAt: { type: Date, required: true, index: true },
    endedAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);



module.exports = mongoose.model('Packge', PackgeSchema);
