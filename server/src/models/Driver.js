const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  licenseNumber: { type: String, required: true, uppercase: true, trim: true },
  licenseCategory: { type: String, default: 'HEAVY_COMMERCIAL' },
  licenseExpiry: { type: Date, required: true },
  status: {
    type: String,
    enum: ['AVAILABLE', 'ASSIGNED', 'ON_TRIP', 'ON_LEAVE', 'SUSPENDED'],
    default: 'AVAILABLE',
    index: true
  },
  safetyScore: { type: Number, default: 100, min: 0, max: 100 },
  assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
  totalTripsCompleted: { type: Number, default: 0 },
  totalDistanceKm: { type: Number, default: 0 },
  onTimeDeliveries: { type: Number, default: 0 },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relationship: { type: String, default: '' }
  },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

driverSchema.index({ licenseNumber: 1, company: 1 }, { unique: true });
driverSchema.index({ email: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Driver', driverSchema);
