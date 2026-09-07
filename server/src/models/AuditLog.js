const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  actorName: { type: String, default: 'System' },
  actorEmail: { type: String, default: '' },
  action: { type: String, required: true, trim: true },
  module: { type: String, required: true, trim: true },
  recordId: { type: String, default: '' },
  previousState: { type: mongoose.Schema.Types.Mixed, default: null },
  newState: { type: mongoose.Schema.Types.Mixed, default: null },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true }
}, { timestamps: true });

auditLogSchema.index({ company: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
