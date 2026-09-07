const express = require('express');
const router = express.Router();
const {
  getMaintenanceList,
  getMaintenanceById,
  createWorkOrder,
  updateWorkOrderStatus,
  deleteWorkOrder
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', checkPermission('maintenance', 'view'), getMaintenanceList);
router.get('/:id', checkPermission('maintenance', 'view'), getMaintenanceById);
router.post('/', checkPermission('maintenance', 'create'), createWorkOrder);
router.put('/:id/status', checkPermission('maintenance', 'edit'), updateWorkOrderStatus);
router.delete('/:id', checkPermission('maintenance', 'delete'), deleteWorkOrder);

module.exports = router;
