const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', checkPermission('customers', 'view'), getCustomers);
router.post('/', checkPermission('customers', 'create'), createCustomer);
router.put('/:id', checkPermission('customers', 'edit'), updateCustomer);
router.delete('/:id', checkPermission('customers', 'delete'), deleteCustomer);

module.exports = router;
