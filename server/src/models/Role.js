const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: [
      'ADMIN',
      'FLEET_MANAGER',
      'DISPATCHER',
      'DRIVER',
      'OPERATIONS_MANAGER',
      'FINANCE_MANAGER',
      'SAFETY_MANAGER'
    ]
  },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  description: { type: String, default: '' },
  permissions: [{
    module: {
      type: String,
      required: true,
      enum: [
        'dashboard',
        'vehicles',
        'drivers',
        'trips',
        'deliveries',
        'routes',
        'customers',
        'maintenance',
        'fuel',
        'expenses',
        'budgets',
        'safety',
        'documents',
        'analytics',
        'reports',
        'users',
        'roles',
        'auditLogs',
        'settings'
      ]
    },
    actions: [{
      type: String,
      enum: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'assign', 'manage']
    }]
  }]
}, { timestamps: true });

roleSchema.index({ name: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
