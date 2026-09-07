const mongoose = require('mongoose');

const vehicleGroupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true }
}, { timestamps: true });

vehicleGroupSchema.index({ name: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('VehicleGroup', vehicleGroupSchema);
