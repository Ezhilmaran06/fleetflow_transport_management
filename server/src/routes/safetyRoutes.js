const express = require('express');
const router = express.Router();
const {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncidentStatus,
  getComplianceOverview
} = require('../controllers/safetyController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

router.get('/compliance', checkPermission('safety', 'view'), getComplianceOverview);
router.get('/', checkPermission('safety', 'view'), getIncidents);
router.get('/:id', checkPermission('safety', 'view'), getIncidentById);
router.post('/', checkPermission('safety', 'create'), createIncident);
router.put('/:id/status', checkPermission('safety', 'edit'), updateIncidentStatus);

module.exports = router;
