const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, approveExpense, deleteExpense } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/', checkPermission('expenses', 'view'), getExpenses);
router.post('/', checkPermission('expenses', 'create'), upload.single('receipt'), createExpense);
router.put('/:id/approve', checkPermission('expenses', 'approve'), approveExpense);
router.delete('/:id', checkPermission('expenses', 'delete'), deleteExpense);

module.exports = router;
