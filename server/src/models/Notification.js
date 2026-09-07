const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: [
      'TRIP_ASSIGNED',
      'TRIP_STATUS',
      'DELIVERY_STATUS',
      'MAINTENANCE_DUE',
      'DOCUMENT_EXPIRING',
      'EXPENSE_STATUS',
      'INCIDENT_ALERT',
      'SYSTEM'
    ],
    default: 'SYSTEM'
  },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false, index: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
