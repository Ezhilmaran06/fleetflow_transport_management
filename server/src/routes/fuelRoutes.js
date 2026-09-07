const express = require('express');
const router = express.Router();
const { getFuelRecords, createFuelRecord, deleteFuelRecord } = require('../controllers/fuelController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', checkPermission('fuel', 'view'), getFuelRecords);
router.post('/', checkPermission('fuel', 'create'), createFuelRecord);
router.delete('/:id', checkPermission('fuel', 'delete'), deleteFuelRecord);

module.exports = router;
