const FuelRecord = require('../models/FuelRecord');
const Vehicle = require('../models/Vehicle');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

const getFuelRecords = async (req, res, next) => {
  try {
    const { vehicleId, driverId, page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc' } = req.query;

    const query = { company: req.companyId };
    if (vehicleId) query.vehicle = vehicleId;
    if (driverId) query.driver = driverId;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [records, total] = await Promise.all([
      FuelRecord.find(query)
        .populate('vehicle', 'registrationNumber make model')
        .populate('driver', 'firstName lastName')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      FuelRecord.countDocuments(query)
    ]);

    return successResponse(res, {
      data: records,
      metadata: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      message: 'Fuel records retrieved'
    });
  } catch (error) {
    next(error);
  }
};

const createFuelRecord = async (req, res, next) => {
  try {
    const { vehicleId, driverId, tripId, liters, cost, odometer, stationName, date, notes } = req.body;

    if (!vehicleId || !liters || !cost || !odometer) {
      return errorResponse(res, {
        message: 'Vehicle, liters, cost, and odometer reading are required',
        statusCode: 400
      });
    }

    const vehicle = await Vehicle.findOne({ _id: vehicleId, company: req.companyId, isDeleted: false });
    if (!vehicle) return errorResponse(res, { message: 'Vehicle not found', statusCode: 404 });

    const fuelRecord = await FuelRecord.create({
      vehicle: vehicleId,
      driver: driverId || vehicle.assignedDriver || null,
      trip: tripId || null,
      liters: parseFloat(liters),
      cost: parseFloat(cost),
      odometer: parseFloat(odometer),
      stationName: stationName || '',
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
      company: req.companyId
    });

    // Update vehicle odometer and fuel level
    if (parseFloat(odometer) > (vehicle.mileage || 0)) {
      vehicle.mileage = parseFloat(odometer);
    }
    vehicle.fuelLevel = 100; // Refueled
    await vehicle.save();

    await logAudit({
      actor: req.user._id,
      action: 'FUEL_RECORD_CREATE',
      module: 'FINANCE',
      recordId: fuelRecord._id,
      newState: fuelRecord,
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: fuelRecord,
      message: 'Fuel transaction logged successfully',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

const deleteFuelRecord = async (req, res, next) => {
  try {
    const record = await FuelRecord.findOneAndDelete({ _id: req.params.id, company: req.companyId });
    if (!record) return errorResponse(res, { message: 'Fuel record not found', statusCode: 404 });

    await logAudit({
      actor: req.user._id,
      action: 'FUEL_RECORD_DELETE',
      module: 'FINANCE',
      recordId: record._id,
      req,
      company: req.companyId
    });

    return successResponse(res, { message: 'Fuel record deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFuelRecords,
  createFuelRecord,
  deleteFuelRecord
};
