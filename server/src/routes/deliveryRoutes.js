const express = require('express');
const router = express.Router();
const {
  getDeliveries,
  getDeliveryById,
  createDelivery,
  updateDeliveryStatus,
  uploadProofOfDelivery,
  deleteDelivery
} = require('../controllers/deliveryController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/', checkPermission('deliveries', 'view'), getDeliveries);
router.get('/:id', checkPermission('deliveries', 'view'), getDeliveryById);
router.post('/', checkPermission('deliveries', 'create'), createDelivery);
router.put('/:id/status', checkPermission('deliveries', 'edit'), updateDeliveryStatus);
router.post('/:id/proof', checkPermission('deliveries', 'edit'), upload.single('proofFile'), uploadProofOfDelivery);
router.delete('/:id', checkPermission('deliveries', 'delete'), deleteDelivery);

module.exports = router;
