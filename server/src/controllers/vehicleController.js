const Vehicle = require('../models/Vehicle');
const VehicleGroup = require('../models/VehicleGroup');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

/**
 * Get paginated list of vehicles
 */
const getVehicles = async (req, res, next) => {
  try {
    const { status, type, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = { company: req.companyId, isDeleted: false };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (type && type !== 'ALL') {
      query.type = type;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { registrationNumber: searchRegex },
        { make: searchRegex },
        { model: searchRegex },
        { vin: searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .populate('assignedDriver', 'firstName lastName phone licenseNumber')
        .populate('vehicleGroup', 'name')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Vehicle.countDocuments(query)
    ]);

    return successResponse(res, {
      data: vehicles,
      metadata: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      message: 'Vehicles retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vehicle by ID
 */
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, company: req.companyId, isDeleted: false })
      .populate('assignedDriver', 'firstName lastName phone email licenseNumber status')
      .populate('vehicleGroup', 'name description');

    if (!vehicle) {
      return errorResponse(res, {
        message: 'Vehicle not found',
        statusCode: 404,
        errorCode: 'VEHICLE_NOT_FOUND'
      });
    }

    return successResponse(res, {
      data: vehicle,
      message: 'Vehicle details retrieved'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new vehicle
 */
const createVehicle = async (req, res, next) => {
  try {
    const {
      registrationNumber,
      vin,
      make,
      model,
      year,
      type,
      fuelType,
      mileage,
      fuelLevel,
      capacityKg,
      vehicleGroup,
      notes
    } = req.body;

    if (!registrationNumber || !make || !model || !year) {
      return errorResponse(res, {
        message: 'Registration number, make, model, and year are required',
        statusCode: 400,
        errorCode: 'MISSING_FIELDS'
      });
    }

    const regUpper = registrationNumber.trim().toUpperCase();

    // Check duplicate registration within company
    const existing = await Vehicle.findOne({ registrationNumber: regUpper, company: req.companyId, isDeleted: false });
    if (existing) {
      return errorResponse(res, {
        message: `Vehicle with registration ${regUpper} already exists in your fleet`,
        statusCode: 409,
        errorCode: 'DUPLICATE_REGISTRATION'
      });
    }

    const vehicle = await Vehicle.create({
      registrationNumber: regUpper,
      vin: vin ? vin.trim().toUpperCase() : '',
      make: make.trim(),
      model: model.trim(),
      year: parseInt(year, 10),
      type: type || 'TRUCK',
      fuelType: fuelType || 'DIESEL',
      mileage: mileage ? parseFloat(mileage) : 0,
      fuelLevel: fuelLevel !== undefined ? parseFloat(fuelLevel) : 100,
      capacityKg: capacityKg ? parseFloat(capacityKg) : 0,
      vehicleGroup: vehicleGroup || null,
      notes: notes || '',
      company: req.companyId
    });

    await logAudit({
      actor: req.user._id,
      action: 'VEHICLE_CREATE',
      module: 'FLEET',
      recordId: vehicle._id,
      newState: vehicle,
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: vehicle,
      message: 'Vehicle added successfully',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update vehicle
 */
const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, company: req.companyId, isDeleted: false });
    if (!vehicle) {
      return errorResponse(res, {
        message: 'Vehicle not found',
        statusCode: 404,
        errorCode: 'VEHICLE_NOT_FOUND'
      });
    }

    const oldState = vehicle.toObject();

    const allowedFields = [
      'make', 'model', 'year', 'type', 'fuelType', 'mileage', 'fuelLevel',
      'capacityKg', 'status', 'vehicleGroup', 'notes', 'vin',
      'nextServiceMileage', 'nextServiceDate', 'insuranceExpiryDate', 'registrationExpiryDate'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        vehicle[field] = req.body[field];
      }
    });

    if (req.body.registrationNumber) {
      const regUpper = req.body.registrationNumber.trim().toUpperCase();
      if (regUpper !== vehicle.registrationNumber) {
        const dup = await Vehicle.findOne({
          registrationNumber: regUpper,
          company: req.companyId,
          _id: { $ne: vehicle._id },
          isDeleted: false
        });
        if (dup) {
          return errorResponse(res, {
            message: `Registration number '${regUpper}' is already registered`,
            statusCode: 409,
            errorCode: 'DUPLICATE_REGISTRATION'
          });
        }
        vehicle.registrationNumber = regUpper;
      }
    }

    await vehicle.save();

    await logAudit({
      actor: req.user._id,
      action: 'VEHICLE_UPDATE',
      module: 'FLEET',
      recordId: vehicle._id,
      previousState: oldState,
      newState: vehicle,
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: vehicle,
      message: 'Vehicle updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign driver to vehicle
 */
const assignDriver = async (req, res, next) => {
  try {
    const { driverId } = req.body;
    const vehicle = await Vehicle.findOne({ _id: req.params.id, company: req.companyId, isDeleted: false });

    if (!vehicle) {
      return errorResponse(res, {
        message: 'Vehicle not found',
        statusCode: 404,
        errorCode: 'VEHICLE_NOT_FOUND'
      });
    }

    if (vehicle.status === 'MAINTENANCE' || vehicle.status === 'INACTIVE') {
      return errorResponse(res, {
        message: `Cannot assign driver to vehicle in '${vehicle.status}' status`,
        statusCode: 422,
        errorCode: 'INVALID_VEHICLE_STATUS'
      });
    }

    if (driverId) {
      const driver = await Driver.findOne({ _id: driverId, company: req.companyId, isDeleted: false });
      if (!driver) {
        return errorResponse(res, {
          message: 'Driver not found',
          statusCode: 404,
          errorCode: 'DRIVER_NOT_FOUND'
        });
      }

      if (driver.status === 'SUSPENDED' || driver.status === 'ON_LEAVE') {
        return errorResponse(res, {
          message: `Driver cannot be assigned while status is '${driver.status}'`,
          statusCode: 422,
          errorCode: 'DRIVER_INELIGIBLE'
        });
      }

      vehicle.assignedDriver = driver._id;
      driver.assignedVehicle = vehicle._id;
      if (driver.status === 'AVAILABLE') driver.status = 'ASSIGNED';
      await driver.save();
    } else {
      // Unassign
      if (vehicle.assignedDriver) {
        const prevDriver = await Driver.findById(vehicle.assignedDriver);
        if (prevDriver) {
          prevDriver.assignedVehicle = null;
          if (prevDriver.status === 'ASSIGNED') prevDriver.status = 'AVAILABLE';
          await prevDriver.save();
        }
      }
      vehicle.assignedDriver = null;
    }

    await vehicle.save();

    await logAudit({
      actor: req.user._id,
      action: 'VEHICLE_ASSIGN_DRIVER',
      module: 'FLEET',
      recordId: vehicle._id,
      newState: { assignedDriver: driverId },
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: vehicle,
      message: driverId ? 'Driver assigned successfully' : 'Driver unassigned successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete vehicle (soft delete)
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, company: req.companyId, isDeleted: false });
    if (!vehicle) {
      return errorResponse(res, {
        message: 'Vehicle not found',
        statusCode: 404,
        errorCode: 'VEHICLE_NOT_FOUND'
      });
    }

    // Check if on active trip
    const activeTrip = await Trip.findOne({
      vehicle: vehicle._id,
      status: { $in: ['ASSIGNED', 'IN_TRANSIT', 'READY'] },
      isDeleted: false
    });

    if (activeTrip) {
      return errorResponse(res, {
        message: `Cannot delete vehicle with active trip #${activeTrip.tripNumber}`,
        statusCode: 409,
        errorCode: 'VEHICLE_ACTIVE_TRIP_CONFLICT'
      });
    }

    vehicle.isDeleted = true;
    vehicle.deletedAt = new Date();
    vehicle.deletedBy = req.user._id;
    await vehicle.save();

    await logAudit({
      actor: req.user._id,
      action: 'VEHICLE_DELETE',
      module: 'FLEET',
      recordId: vehicle._id,
      req,
      company: req.companyId
    });

    return successResponse(res, {
      message: 'Vehicle removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Vehicle Groups
 */
const getVehicleGroups = async (req, res, next) => {
  try {
    const groups = await VehicleGroup.find({ company: req.companyId }).sort({ name: 1 });
    return successResponse(res, { data: groups });
  } catch (error) {
    next(error);
  }
};

const createVehicleGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return errorResponse(res, { message: 'Group name is required', statusCode: 400 });
    }

    const group = await VehicleGroup.create({
      name: name.trim(),
      description: description || '',
      company: req.companyId
    });

    return successResponse(res, { data: group, message: 'Group created', statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  assignDriver,
  deleteVehicle,
  getVehicleGroups,
  createVehicleGroup
};
