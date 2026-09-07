const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  packageDetails: {
    description: { type: String, default: '' },
    weightKg: { type: Number, default: 0 },
    pieces: { type: Number, default: 1 }
  },
  pickupAddress: { type: String, required: true },
  dropoffAddress: { type: String, required: true },
  status: {
    type: String,
    enum: [
      'PENDING',
      'PICKED_UP',
      'IN_TRANSIT',
      'DELIVERED',
      'DELAYED',
      'FAILED',
      'CANCELLED'
    ],
    default: 'PENDING',
    index: true
  },
  estimatedDeliveryTime: { type: Date },
  actualDeliveryTime: { type: Date },
  proofOfDelivery: {
    fileUrl: { type: String, default: '' },
    signedBy: { type: String, default: '' },
    notes: { type: String, default: '' },
    timestamp: { type: Date }
  },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true }
}, { timestamps: true });

deliverySchema.index({ trackingNumber: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Delivery', deliverySchema);
