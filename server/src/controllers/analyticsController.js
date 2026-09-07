const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Delivery = require('../models/Delivery');
const Maintenance = require('../models/Maintenance');
const FuelRecord = require('../models/FuelRecord');
const Expense = require('../models/Expense');
const Incident = require('../models/Incident');
const { successResponse } = require('../utils/response');

/**
 * Real Aggregated Analytics Engine
 */
const getFleetAnalytics = async (req, res, next) => {
  try {
    const company = req.companyId;

    const [statusDistribution, typeDistribution] = await Promise.all([
      Vehicle.aggregate([
        { $match: { company, isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Vehicle.aggregate([
        { $match: { company, isDeleted: false } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ])
    ]);

    return successResponse(res, {
      data: {
        statusDistribution: statusDistribution.map(item => ({ status: item._id, count: item.count })),
        typeDistribution: typeDistribution.map(item => ({ type: item._id, count: item.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDeliveryAnalytics = async (req, res, next) => {
  try {
    const company = req.companyId;

    const statusCounts = await Delivery.aggregate([
      { $match: { company } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    return successResponse(res, {
      data: {
        statusCounts: statusCounts.map(item => ({ status: item._id, count: item.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};

const getFinancialAnalytics = async (req, res, next) => {
  try {
    const company = req.companyId;

    const [fuelByMonth, expensesByCategory, maintenanceByMonth] = await Promise.all([
      FuelRecord.aggregate([
        { $match: { company } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            totalCost: { $sum: '$cost' },
            totalLiters: { $sum: '$liters' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Expense.aggregate([
        { $match: { company, status: 'APPROVED' } },
        { $group: { _id: '$category', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Maintenance.aggregate([
        { $match: { company, status: 'COMPLETED' } },
        {
          $group: {
            _id: {
              year: { $year: '$scheduledDate' },
              month: { $month: '$scheduledDate' }
            },
            totalCost: { $sum: '$actualCost' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const formattedFuel = fuelByMonth.map(item => ({
      period: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      totalCost: item.totalCost,
      totalLiters: item.totalLiters
    }));

    const formattedMaintenance = maintenanceByMonth.map(item => ({
      period: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      totalCost: item.totalCost
    }));

    return successResponse(res, {
      data: {
        fuelTrends: formattedFuel,
        maintenanceTrends: formattedMaintenance,
        expensesByCategory: expensesByCategory.map(item => ({ category: item._id, amount: item.totalAmount, count: item.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};

const getSafetyAnalytics = async (req, res, next) => {
  try {
    const company = req.companyId;

    const [severityCounts, statusCounts] = await Promise.all([
      Incident.aggregate([
        { $match: { company } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Incident.aggregate([
        { $match: { company } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    return successResponse(res, {
      data: {
        severityDistribution: severityCounts.map(item => ({ severity: item._id, count: item.count })),
        statusDistribution: statusCounts.map(item => ({ status: item._id, count: item.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFleetAnalytics,
  getDeliveryAnalytics,
  getFinancialAnalytics,
  getSafetyAnalytics
};
