const express = require('express');
const router = express.Router();
const {
  generateReport,
  getSavedReports,
  saveReport,
  deleteSavedReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

router.post('/generate', checkPermission('reports', 'view'), generateReport);
router.get('/saved', checkPermission('reports', 'view'), getSavedReports);
router.post('/saved', checkPermission('reports', 'create'), saveReport);
router.delete('/saved/:id', checkPermission('reports', 'delete'), deleteSavedReport);

module.exports = router;
