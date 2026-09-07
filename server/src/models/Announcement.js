const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  audience: {
    type: String,
    enum: ['ALL', 'DRIVERS', 'DISPATCHERS', 'FLEET_MANAGERS', 'MANAGEMENT'],
    default: 'ALL'
  },
  priority: {
    type: String,
    enum: ['NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL'
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'PUBLISHED'
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
