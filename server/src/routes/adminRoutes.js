const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  updateRolePermissions,
  getAuditLogs,
  getSettings,
  updateSettings
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

// Users (Admin only)
router.get('/users', authorize('ADMIN'), getUsers);
router.post('/users', authorize('ADMIN'), createUser);
router.put('/users/:id', authorize('ADMIN'), updateUser);
router.delete('/users/:id', authorize('ADMIN'), deleteUser);

// Roles & Matrix (Admin only)
router.get('/roles', authorize('ADMIN'), getRoles);
router.put('/roles/:id/permissions', authorize('ADMIN'), updateRolePermissions);

// Audit Logs (Admin only)
router.get('/audit-logs', authorize('ADMIN'), getAuditLogs);

// Settings
router.get('/settings', getSettings);
router.put('/settings', authorize('ADMIN'), updateSettings);

module.exports = router;
