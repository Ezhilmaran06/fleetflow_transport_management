const Expense = require('../models/Expense');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');
const createNotification = require('../utils/notificationHelper');

const getExpenses = async (req, res, next) => {
  try {
    const { status, category, vehicleId, page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = req.query;

    const query = { company: req.companyId };
    if (status && status !== 'ALL') query.status = status;
    if (category && category !== 'ALL') query.category = category;
    if (vehicleId) query.vehicle = vehicleId;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate('vehicle', 'registrationNumber make model')
        .populate('submittedBy', 'firstName lastName email')
        .populate('approvedBy', 'firstName lastName email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Expense.countDocuments(query)
    ]);

    return successResponse(res, {
      data: expenses,
      metadata: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      message: 'Expenses retrieved'
    });
  } catch (error) {
    next(error);
  }
};

const createExpense = async (req, res, next) => {
  try {
    const { category, amount, description, vehicleId, tripId, date, receiptUrl } = req.body;

    if (!category || !amount || !description) {
      return errorResponse(res, {
        message: 'Category, amount, and description are required',
        statusCode: 400
      });
    }

    const expenseNumber = `EXP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;
    const finalReceiptUrl = req.file ? `/uploads/${req.file.filename}` : receiptUrl || '';

    const expense = await Expense.create({
      expenseNumber,
      category,
      amount: parseFloat(amount),
      description: description.trim(),
      vehicle: vehicleId || null,
      trip: tripId || null,
      submittedBy: req.user._id,
      receiptUrl: finalReceiptUrl,
      date: date ? new Date(date) : new Date(),
      company: req.companyId
    });

    await logAudit({
      actor: req.user._id,
      action: 'EXPENSE_SUBMIT',
      module: 'FINANCE',
      recordId: expense._id,
      newState: expense,
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: expense,
      message: 'Expense submitted for review',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

const approveExpense = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return errorResponse(res, { message: "Status must be 'APPROVED' or 'REJECTED'", statusCode: 400 });
    }

    const expense = await Expense.findOne({ _id: req.params.id, company: req.companyId })
      .populate('submittedBy');

    if (!expense) return errorResponse(res, { message: 'Expense not found', statusCode: 404 });

    const oldStatus = expense.status;
    expense.status = status;
    expense.approvedBy = req.user._id;
    if (status === 'REJECTED' && rejectionReason) {
      expense.rejectionReason = rejectionReason;
    }

    await expense.save();

    // Create notification for submitter
    if (expense.submittedBy) {
      await createNotification({
        recipient: expense.submittedBy._id,
        title: `Expense Claim ${status}`,
        message: `Your expense #${expense.expenseNumber} for $${expense.amount} was ${status.toLowerCase()}`,
        type: 'EXPENSE_STATUS',
        link: '/expenses',
        company: req.companyId
      });
    }

    await logAudit({
      actor: req.user._id,
      action: `EXPENSE_${status}`,
      module: 'FINANCE',
      recordId: expense._id,
      previousState: { status: oldStatus },
      newState: { status, approvedBy: req.user._id },
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: expense,
      message: `Expense claim has been ${status.toLowerCase()}`
    });
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, company: req.companyId });
    if (!expense) return errorResponse(res, { message: 'Expense not found', statusCode: 404 });

    await logAudit({
      actor: req.user._id,
      action: 'EXPENSE_DELETE',
      module: 'FINANCE',
      recordId: expense._id,
      req,
      company: req.companyId
    });

    return successResponse(res, { message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  approveExpense,
  deleteExpense
};
