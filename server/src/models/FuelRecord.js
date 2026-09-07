const mongoose = require('mongoose');

const fuelRecordSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
  liters: { type: Number, required: true, min: 0.1 },
  cost: { type: Number, required: true, min: 0 },
  pricePerLiter: { type: Number, default: 0 },
  odometer: { type: Number, required: true, min: 0 },
  stationName: { type: String, default: '' },
  date: { type: Date, default: Date.now, index: true },
  notes: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true }
}, { timestamps: true });

fuelRecordSchema.pre('save', function (next) {
  if (this.liters > 0 && this.cost > 0) {
    this.pricePerLiter = Number((this.cost / this.liters).toFixed(2));
  }
  next();
});

module.exports = mongoose.model('FuelRecord', fuelRecordSchema);
