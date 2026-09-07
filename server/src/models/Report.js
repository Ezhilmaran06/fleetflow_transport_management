const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  module: {
    type: String,
    required: true,
    enum: ['FLEET', 'DRIVERS', 'TRIPS', 'DELIVERIES', 'MAINTENANCE', 'FUEL', 'EXPENSES', 'SAFETY']
  },
  filters: { type: mongoose.Schema.Types.Mixed, default: {} },
  columns: [{ type: String }],
  format: { type: String, enum: ['CSV', 'JSON'], default: 'CSV' },
  isSaved: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
