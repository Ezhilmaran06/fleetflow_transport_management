const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  assignDriver,
  deleteVehicle,
  getVehicleGroups,
  createVehicleGroup
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', checkPermission('vehicles', 'view'), getVehicles);
router.get('/groups', checkPermission('vehicles', 'view'), getVehicleGroups);
router.post('/groups', checkPermission('vehicles', 'create'), createVehicleGroup);
router.get('/:id', checkPermission('vehicles', 'view'), getVehicleById);
router.post('/', checkPermission('vehicles', 'create'), createVehicle);
router.put('/:id', checkPermission('vehicles', 'edit'), updateVehicle);
router.put('/:id/assign-driver', checkPermission('vehicles', 'assign'), assignDriver);
router.delete('/:id', checkPermission('vehicles', 'delete'), deleteVehicle);

module.exports = router;
