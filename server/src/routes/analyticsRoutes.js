const express = require('express');
const router = express.Router();
const {
  getFleetAnalytics,
  getDeliveryAnalytics,
  getFinancialAnalytics,
  getSafetyAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

router.get('/fleet', checkPermission('analytics', 'view'), getFleetAnalytics);
router.get('/deliveries', checkPermission('analytics', 'view'), getDeliveryAnalytics);
router.get('/finance', checkPermission('analytics', 'view'), getFinancialAnalytics);
router.get('/safety', checkPermission('analytics', 'view'), getSafetyAnalytics);

module.exports = router;
