const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, unique: true, index: true },
  operationalDefaults: {
    speedLimitKmh: { type: Number, default: 90 },
    serviceIntervalKm: { type: Number, default: 10000 },
    serviceIntervalMonths: { type: Number, default: 6 },
    workingHoursPerDay: { type: Number, default: 10 },
    fuelUnit: { type: String, default: 'Liters' },
    distanceUnit: { type: String, default: 'Kilometers' }
  },
  notificationsConfig: {
    emailAlerts: { type: Boolean, default: false },
    tripAssignments: { type: Boolean, default: true },
    maintenanceAlerts: { type: Boolean, default: true },
    documentExpiryDays: { type: Number, default: 30 }
  },
  integrationConfig: {
    gpsProvider: { type: String, default: 'None' },
    gpsConfigured: { type: Boolean, default: false },
    gpsApiKey: { type: String, default: '' },
    mapsProvider: { type: String, default: 'None' },
    mapsConfigured: { type: Boolean, default: false },
    mapsApiKey: { type: String, default: '' },
    emailProvider: { type: String, default: 'None' },
    emailConfigured: { type: Boolean, default: false },
    storageProvider: { type: String, default: 'Local' },
    storageConfigured: { type: Boolean, default: true }
  },
  themeConfig: {
    defaultTheme: { type: String, enum: ['dark', 'light'], default: 'dark' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
