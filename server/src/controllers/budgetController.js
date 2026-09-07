const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

const getBudgets = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const budgets = await Budget.find({
      company: req.companyId,
      year: parseInt(year, 10)
    }).sort({ department: 1 });

    // Aggregate actual approved expenses by department / category for the year
    const startOfYear = new Date(parseInt(year, 10), 0, 1);
    const endOfYear = new Date(parseInt(year, 10), 11, 31, 23, 59, 59);

    const expenseSums = await Expense.aggregate([
      {
        $match: {
          company: req.companyId,
          status: 'APPROVED',
          date: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);

    const expenseMap = {};
    expenseSums.forEach(e => {
      expenseMap[e._id] = e.totalSpent;
    });

    const budgetsWithSpending = budgets.map(b => {
      const bObj = b.toObject();
      const actualSpent = expenseMap[b.department] || 0;
      const remaining = Math.max(0, b.allocatedAmount - actualSpent);
      const utilization = b.allocatedAmount > 0 ? Math.round((actualSpent / b.allocatedAmount) * 100) : 0;
      return {
        ...bObj,
        actualSpent,
        remaining,
        utilization
      };
    });

    return successResponse(res, { data: budgetsWithSpending });
  } catch (error) {
    next(error);
  }
};

const createBudget = async (req, res, next) => {
  try {
    const { department, period, year, month, allocatedAmount } = req.body;
    if (!department || !year || allocatedAmount === undefined) {
      return errorResponse(res, { message: 'Department, year, and allocated amount are required', statusCode: 400 });
    }

    const budget = await Budget.create({
      department,
      period: period || 'ANNUAL',
      year: parseInt(year, 10),
      month: month ? parseInt(month, 10) : undefined,
      allocatedAmount: parseFloat(allocatedAmount),
      company: req.companyId
    });

    await logAudit({
      actor: req.user._id,
      action: 'BUDGET_CREATE',
      module: 'FINANCE',
      recordId: budget._id,
      req,
      company: req.companyId
    });

    return successResponse(res, { data: budget, message: 'Budget allocated', statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndUpdate({ _id: req.params.id, company: req.companyId }, req.body, { new: true });
    if (!budget) return errorResponse(res, { message: 'Budget not found', statusCode: 404 });
    return successResponse(res, { data: budget, message: 'Budget updated' });
  } catch (error) {
    next(error);
  }
};

const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, company: req.companyId });
    if (!budget) return errorResponse(res, { message: 'Budget not found', statusCode: 404 });
    return successResponse(res, { message: 'Budget deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};
