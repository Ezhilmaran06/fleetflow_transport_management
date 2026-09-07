const Report = require('../models/Report');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Delivery = require('../models/Delivery');
const Maintenance = require('../models/Maintenance');
const FuelRecord = require('../models/FuelRecord');
const Expense = require('../models/Expense');
const Incident = require('../models/Incident');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Run dynamic report query and return records
 */
const runReportQuery = async (module, company, filters = {}) => {
  let query = { company };
  const { startDate, endDate, status } = filters;

  if (status && status !== 'ALL') query.status = status;

  switch (module) {
    case 'FLEET':
      query.isDeleted = false;
      return await Vehicle.find(query)
        .populate('assignedDriver', 'firstName lastName phone')
        .populate('vehicleGroup', 'name')
        .lean();

    case 'DRIVERS':
      query.isDeleted = false;
      return await Driver.find(query).populate('assignedVehicle', 'registrationNumber make model').lean();

    case 'TRIPS':
      query.isDeleted = false;
      if (startDate || endDate) {
        query.scheduledStart = {};
        if (startDate) query.scheduledStart.$gte = new Date(startDate);
        if (endDate) query.scheduledStart.$lte = new Date(endDate);
      }
      return await Trip.find(query)
        .populate('vehicle', 'registrationNumber make model')
        .populate('driver', 'firstName lastName')
        .lean();

    case 'DELIVERIES':
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      return await Delivery.find(query).populate('customer', 'name phone').lean();

    case 'MAINTENANCE':
      if (startDate || endDate) {
        query.scheduledDate = {};
        if (startDate) query.scheduledDate.$gte = new Date(startDate);
        if (endDate) query.scheduledDate.$lte = new Date(endDate);
      }
      return await Maintenance.find(query).populate('vehicle', 'registrationNumber make model').lean();

    case 'FUEL':
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }
      return await FuelRecord.find(query).populate('vehicle', 'registrationNumber').populate('driver', 'firstName lastName').lean();

    case 'EXPENSES':
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }
      return await Expense.find(query).populate('vehicle', 'registrationNumber').populate('submittedBy', 'firstName lastName').lean();

    case 'SAFETY':
      if (startDate || endDate) {
        query.incidentDate = {};
        if (startDate) query.incidentDate.$gte = new Date(startDate);
        if (endDate) query.incidentDate.$lte = new Date(endDate);
      }
      return await Incident.find(query).populate('vehicle', 'registrationNumber').populate('driver', 'firstName lastName').lean();

    default:
      return [];
  }
};

/**
 * Generate Report Preview or Data
 */
const generateReport = async (req, res, next) => {
  try {
    const { module, filters = {}, format = 'JSON' } = req.body;

    if (!module) {
      return errorResponse(res, { message: 'Module selection is required', statusCode: 400 });
    }

    const records = await runReportQuery(module, req.companyId, filters);

    if (format === 'CSV') {
      if (records.length === 0) {
        return res.status(200).send('No data found for the selected criteria');
      }

      // Convert flat JSON to CSV string
      const headers = Object.keys(records[0]).filter(k => !['_id', '__v', 'company', 'deletedBy'].includes(k));
      const csvRows = [headers.join(',')];

      records.forEach(row => {
        const values = headers.map(header => {
          let val = row[header];
          if (val === null || val === undefined) return '""';
          if (typeof val === 'object') {
            val = val.name || val.registrationNumber || val.firstName ? `${val.firstName || ''} ${val.lastName || ''}`.trim() : JSON.stringify(val);
          }
          val = String(val).replace(/"/g, '""');
          return `"${val}"`;
        });
        csvRows.push(values.join(','));
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=FleetFlow_${module}_Report.csv`);
      return res.status(200).send(csvRows.join('\n'));
    }

    return successResponse(res, {
      data: records,
      metadata: { total: records.length, module },
      message: 'Report generated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Saved Reports CRUD
 */
const getSavedReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ company: req.companyId }).populate('createdBy', 'firstName lastName');
    return successResponse(res, { data: reports });
  } catch (error) {
    next(error);
  }
};

const saveReport = async (req, res, next) => {
  try {
    const { name, description, module, filters, columns, format } = req.body;
    if (!name || !module) {
      return errorResponse(res, { message: 'Report name and module are required', statusCode: 400 });
    }

    const report = await Report.create({
      name: name.trim(),
      description: description || '',
      module,
      filters: filters || {},
      columns: columns || [],
      format: format || 'CSV',
      createdBy: req.user._id,
      company: req.companyId
    });

    return successResponse(res, { data: report, message: 'Report configuration saved', statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

const deleteSavedReport = async (req, res, next) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, company: req.companyId });
    if (!report) return errorResponse(res, { message: 'Report not found', statusCode: 404 });
    return successResponse(res, { message: 'Saved report deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateReport,
  getSavedReports,
  saveReport,
  deleteSavedReport
};
