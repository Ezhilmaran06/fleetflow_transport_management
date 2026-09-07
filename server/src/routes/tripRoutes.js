const express = require('express');
const router = express.Router();
const {
  getTrips,
  getTripById,
  createTrip,
  updateTripStatus,
  assignTrip,
  deleteTrip
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', checkPermission('trips', 'view'), getTrips);
router.get('/:id', checkPermission('trips', 'view'), getTripById);
router.post('/', checkPermission('trips', 'create'), createTrip);
router.put('/:id/status', checkPermission('trips', 'edit'), updateTripStatus);
router.put('/:id/assign', checkPermission('trips', 'assign'), assignTrip);
router.delete('/:id', checkPermission('trips', 'delete'), deleteTrip);

module.exports = router;
