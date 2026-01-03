const mongoose = require('mongoose');
const { withBaseSchemaOptions } = require('./_shared');

const PlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    priceVnd: { type: Number, required: true, min: 0 },
    interval: { type: String, required: true, enum: ['monthly', 'yearly'] },
    features: { type: mongoose.Schema.Types.Mixed, default: {} },
    active: { type: Boolean, default: true, index: true },
  },
  withBaseSchemaOptions({ collection: 'plans' })
);

module.exports = mongoose.model('Plan', PlanSchema);
