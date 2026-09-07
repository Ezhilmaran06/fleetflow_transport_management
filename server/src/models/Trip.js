const mongoose = require('mongoose');

const tripStopSchema = new mongoose.Schema({
  location: { type: String, required: true, trim: true },
  stopType: { type: String, enum: ['PICKUP', 'DROPOFF', 'REST', 'CHECKPOINT'], default: 'DROPOFF' },
  scheduledTime: { type: Date },
  actualTime: { type: Date },
  status: { type: String, enum: ['PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED'], default: 'PENDING' },
  notes: { type: String, default: '' }
}, { _id: true });

const tripSchema = new mongoose.Schema({
  tripNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },
  origin: { type: String, required: true, trim: true },
  destination: { type: String, required: true, trim: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
  scheduledStart: { type: Date, required: true },
  scheduledEnd: { type: Date },
  actualStart: { type: Date },
  actualEnd: { type: Date },
  distanceKm: { type: Number, default: 0 },
  priority: {
    type: String,
    enum: ['NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL'
  },
  status: {
    type: String,
    enum: [
      'UNASSIGNED',
      'READY',
      'ASSIGNED',
      'ACCEPTED',
      'IN_TRANSIT',
      'DELAYED',
      'COMPLETED',
      'CANCELLED'
    ],
    default: 'UNASSIGNED',
    index: true
  },
  stops: [tripStopSchema],
  notes: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

tripSchema.index({ tripNumber: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Trip', tripSchema);
