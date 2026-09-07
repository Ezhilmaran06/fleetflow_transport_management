const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  incidentNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },
  title: { type: String, required: true, trim: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null, index: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null, index: true },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
    index: true
  },
  status: {
    type: String,
    enum: ['REPORTED', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED'],
    default: 'REPORTED',
    index: true
  },
  incidentDate: { type: Date, required: true, default: Date.now },
  location: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  actionTaken: { type: String, default: '' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resolutionNotes: { type: String, default: '' },
  attachments: [{ type: String }],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true }
}, { timestamps: true });

incidentSchema.index({ incidentNumber: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Incident', incidentSchema);
