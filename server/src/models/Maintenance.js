const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  workOrderNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
  issueDescription: { type: String, required: true, trim: true },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  technician: { type: String, default: '' },
  serviceType: {
    type: String,
    enum: ['ROUTINE', 'REPAIR', 'INSPECTION', 'TIRE_SERVICE', 'EMERGENCY'],
    default: 'ROUTINE'
  },
  scheduledDate: { type: Date, required: true },
  completedDate: { type: Date },
  status: {
    type: String,
    enum: [
      'CREATED',
      'APPROVED',
      'ASSIGNED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED'
    ],
    default: 'CREATED',
    index: true
  },
  estimatedCost: { type: Number, default: 0, min: 0 },
  actualCost: { type: Number, default: 0, min: 0 },
  notes: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true }
}, { timestamps: true });

maintenanceSchema.index({ workOrderNumber: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
