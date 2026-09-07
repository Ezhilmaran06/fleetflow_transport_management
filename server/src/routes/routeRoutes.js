const express = require('express');
const router = express.Router();
const { getRoutes, createRoute, updateRoute, deleteRoute } = require('../controllers/routeController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', checkPermission('routes', 'view'), getRoutes);
router.post('/', checkPermission('routes', 'create'), createRoute);
router.put('/:id', checkPermission('routes', 'edit'), updateRoute);
router.delete('/:id', checkPermission('routes', 'delete'), deleteRoute);

module.exports = router;
