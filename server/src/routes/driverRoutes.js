const express = require('express');
const router = express.Router();
const {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverPerformance
} = require('../controllers/driverController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', checkPermission('drivers', 'view'), getDrivers);
router.get('/:id', checkPermission('drivers', 'view'), getDriverById);
router.get('/:id/performance', checkPermission('drivers', 'view'), getDriverPerformance);
router.post('/', checkPermission('drivers', 'create'), createDriver);
router.put('/:id', checkPermission('drivers', 'edit'), updateDriver);
router.delete('/:id', checkPermission('drivers', 'delete'), deleteDriver);

module.exports = router;
