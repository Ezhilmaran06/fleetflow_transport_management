const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, default: '', trim: true },
  contactPerson: { type: String, default: '', trim: true },
  email: { type: String, lowercase: true, trim: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

customerSchema.index({ name: 1, company: 1 });

module.exports = mongoose.model('Customer', customerSchema);
