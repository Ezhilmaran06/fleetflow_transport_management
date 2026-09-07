const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
    enum: ['OPERATIONS', 'FLEET', 'MAINTENANCE', 'FUEL', 'SAFETY', 'GENERAL']
  },
  period: {
    type: String,
    enum: ['MONTHLY', 'QUARTERLY', 'ANNUAL'],
    default: 'MONTHLY'
  },
  year: { type: Number, required: true },
  month: { type: Number, min: 1, max: 12 },
  allocatedAmount: { type: Number, required: true, min: 0 },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true }
}, { timestamps: true });

budgetSchema.index({ department: 1, year: 1, month: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
