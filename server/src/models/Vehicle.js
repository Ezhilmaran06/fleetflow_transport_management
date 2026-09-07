const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },
  vin: { type: String, uppercase: true, trim: true, default: '' },
  make: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  type: {
    type: String,
    required: true,
    enum: ['TRUCK', 'VAN', 'TRAILER', 'EV', 'CONTAINER', 'SEDAN'],
    default: 'TRUCK'
  },
  fuelType: {
    type: String,
    enum: ['DIESEL', 'PETROL', 'ELECTRIC', 'HYBRID', 'CNG'],
    default: 'DIESEL'
  },
  mileage: { type: Number, default: 0, min: 0 },
  fuelLevel: { type: Number, default: 100, min: 0, max: 100 },
  capacityKg: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['AVAILABLE', 'ASSIGNED', 'IN_TRIP', 'MAINTENANCE', 'INACTIVE'],
    default: 'AVAILABLE',
    index: true
  },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  vehicleGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleGroup', default: null },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  nextServiceMileage: { type: Number, default: 0 },
  nextServiceDate: { type: Date },
  insuranceExpiryDate: { type: Date },
  registrationExpiryDate: { type: Date },
  notes: { type: String, default: '' },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

vehicleSchema.index({ registrationNumber: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
