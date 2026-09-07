const express = require('express');
const router = express.Router();
const { getBudgets, createBudget, updateBudget, deleteBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

router.use(protect);

router.get('/', checkPermission('budgets', 'view'), getBudgets);
router.post('/', checkPermission('budgets', 'create'), createBudget);
router.put('/:id', checkPermission('budgets', 'edit'), updateBudget);
router.delete('/:id', checkPermission('budgets', 'delete'), deleteBudget);

module.exports = router;
