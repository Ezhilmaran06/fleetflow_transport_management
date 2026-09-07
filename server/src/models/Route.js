const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  origin: { type: String, required: true, trim: true },
  destination: { type: String, required: true, trim: true },
  distanceKm: { type: Number, required: true, min: 0 },
  estimatedMinutes: { type: Number, required: true, min: 0 },
  waypoints: [{ type: String, trim: true }],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

routeSchema.index({ name: 1, company: 1 });

module.exports = mongoose.model('Route', routeSchema);
