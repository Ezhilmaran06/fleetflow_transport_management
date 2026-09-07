const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  expenseNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['FUEL', 'MAINTENANCE', 'TOLL', 'PARKING', 'TIRES', 'INSURANCE', 'PERMITS', 'LODGING', 'MISC']
  },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, required: true, trim: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['SUBMITTED', 'APPROVED', 'REJECTED'],
    default: 'SUBMITTED',
    index: true
  },
  receiptUrl: { type: String, default: '' },
  date: { type: Date, default: Date.now, index: true },
  rejectionReason: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true }
}, { timestamps: true });

expenseSchema.index({ expenseNumber: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Expense', expenseSchema);
