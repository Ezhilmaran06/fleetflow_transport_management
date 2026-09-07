const express = require('express');
const router = express.Router();
const { getDashboardKPIs } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);
router.get('/kpis', checkPermission('dashboard', 'view'), getDashboardKPIs);

module.exports = router;
