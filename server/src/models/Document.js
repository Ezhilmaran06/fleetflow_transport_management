const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  documentType: {
    type: String,
    required: true,
    enum: [
      'DRIVER_LICENSE',
      'VEHICLE_INSURANCE',
      'VEHICLE_REGISTRATION',
      'ROAD_PERMIT',
      'FITNESS_CERT',
      'POLLUTION_CERT',
      'CONTRACT',
      'INSPECTION_REPORT',
      'OTHER'
    ]
  },
  ownerType: {
    type: String,
    required: true,
    enum: ['VEHICLE', 'DRIVER', 'COMPANY']
  },
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  documentNumber: { type: String, default: '', trim: true },
  issueDate: { type: Date },
  expiryDate: { type: Date, required: true, index: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
  mimeType: { type: String, default: '' },
  status: {
    type: String,
    enum: ['VALID', 'EXPIRING', 'EXPIRED'],
    default: 'VALID',
    index: true
  },
  notes: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true }
}, { timestamps: true });

documentSchema.methods.calculateStatus = function () {
  const now = new Date();
  const diffDays = Math.ceil((new Date(this.expiryDate) - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    this.status = 'EXPIRED';
  } else if (diffDays <= 30) {
    this.status = 'EXPIRING';
  } else {
    this.status = 'VALID';
  }
  return this.status;
};

documentSchema.pre('save', function (next) {
  if (this.expiryDate) {
    this.calculateStatus();
  }
  next();
});

module.exports = mongoose.model('Document', documentSchema);
