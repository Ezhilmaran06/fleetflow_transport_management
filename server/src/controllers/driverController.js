const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Incident = require('../models/Incident');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

/**
 * Get paginated list of drivers
 */
const getDrivers = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = { company: req.companyId, isDeleted: false };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { licenseNumber: searchRegex },
        { phone: searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [drivers, total] = await Promise.all([
      Driver.find(query)
        .populate('assignedVehicle', 'registrationNumber make model type status')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Driver.countDocuments(query)
    ]);

    return successResponse(res, {
      data: drivers,
      metadata: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      message: 'Drivers retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get driver by ID
 */
const getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ _id: req.params.id, company: req.companyId, isDeleted: false })
      .populate('assignedVehicle', 'registrationNumber make model year mileage fuelLevel status')
      .populate('user', 'email role lastLogin');

    if (!driver) {
      return errorResponse(res, {
        message: 'Driver not found',
        statusCode: 404,
        errorCode: 'DRIVER_NOT_FOUND'
      });
    }

    // Fetch driver trips count and incidents
    const [recentTrips, incidents] = await Promise.all([
      Trip.find({ driver: driver._id, isDeleted: false }).sort({ createdAt: -1 }).limit(5),
      Incident.find({ driver: driver._id }).sort({ incidentDate: -1 }).limit(5)
    ]);

    return successResponse(res, {
      data: {
        ...driver.toObject(),
        recentTrips,
        incidents
      },
      message: 'Driver details retrieved'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new driver
 */
const createDriver = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      licenseNumber,
      licenseCategory,
      licenseExpiry,
      emergencyContact
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !licenseNumber || !licenseExpiry) {
      return errorResponse(res, {
        message: 'First name, last name, email, phone, license number, and license expiry date are required',
        statusCode: 400,
        errorCode: 'MISSING_FIELDS'
      });
    }

    const licUpper = licenseNumber.trim().toUpperCase();
    const emailLower = email.trim().toLowerCase();

    // Check duplicate license or email
    const duplicate = await Driver.findOne({
      company: req.companyId,
      isDeleted: false,
      $or: [{ licenseNumber: licUpper }, { email: emailLower }]
    });

    if (duplicate) {
      return errorResponse(res, {
        message: duplicate.licenseNumber === licUpper 
          ? `Driver with license '${licUpper}' already exists`
          : `Driver with email '${emailLower}' already exists`,
        statusCode: 409,
        errorCode: 'DUPLICATE_DRIVER'
      });
    }

    const driver = await Driver.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: emailLower,
      phone: phone.trim(),
      licenseNumber: licUpper,
      licenseCategory: licenseCategory || 'HEAVY_COMMERCIAL',
      licenseExpiry: new Date(licenseExpiry),
      emergencyContact: emergencyContact || {},
      company: req.companyId
    });

    await logAudit({
      actor: req.user._id,
      action: 'DRIVER_CREATE',
      module: 'DRIVERS',
      recordId: driver._id,
      newState: driver,
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: driver,
      message: 'Driver profile created successfully',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update driver
 */
const updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ _id: req.params.id, company: req.companyId, isDeleted: false });
    if (!driver) {
      return errorResponse(res, {
        message: 'Driver not found',
        statusCode: 404,
        errorCode: 'DRIVER_NOT_FOUND'
      });
    }

    const oldState = driver.toObject();

    const allowedFields = [
      'firstName', 'lastName', 'phone', 'licenseCategory',
      'licenseExpiry', 'status', 'safetyScore', 'emergencyContact'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        driver[field] = req.body[field];
      }
    });

    if (req.body.licenseNumber) {
      const licUpper = req.body.licenseNumber.trim().toUpperCase();
      if (licUpper !== driver.licenseNumber) {
        const dup = await Driver.findOne({
          licenseNumber: licUpper,
          company: req.companyId,
          _id: { $ne: driver._id },
          isDeleted: false
        });
        if (dup) {
          return errorResponse(res, {
            message: `License number '${licUpper}' is already registered`,
            statusCode: 409,
            errorCode: 'DUPLICATE_LICENSE'
          });
        }
        driver.licenseNumber = licUpper;
      }
    }

    await driver.save();

    await logAudit({
      actor: req.user._id,
      action: 'DRIVER_UPDATE',
      module: 'DRIVERS',
      recordId: driver._id,
      previousState: oldState,
      newState: driver,
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: driver,
      message: 'Driver updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete driver (soft delete)
 */
const deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ _id: req.params.id, company: req.companyId, isDeleted: false });
    if (!driver) {
      return errorResponse(res, {
        message: 'Driver not found',
        statusCode: 404,
        errorCode: 'DRIVER_NOT_FOUND'
      });
    }

    const activeTrip = await Trip.findOne({
      driver: driver._id,
      status: { $in: ['ASSIGNED', 'IN_TRANSIT', 'ACCEPTED'] },
      isDeleted: false
    });

    if (activeTrip) {
      return errorResponse(res, {
        message: `Cannot delete driver with active trip #${activeTrip.tripNumber}`,
        statusCode: 409,
        errorCode: 'DRIVER_ACTIVE_TRIP_CONFLICT'
      });
    }

    driver.isDeleted = true;
    driver.deletedAt = new Date();
    driver.deletedBy = req.user._id;
    await driver.save();

    await logAudit({
      actor: req.user._id,
      action: 'DRIVER_DELETE',
      module: 'DRIVERS',
      recordId: driver._id,
      req,
      company: req.companyId
    });

    return successResponse(res, {
      message: 'Driver removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Real driver performance metrics calculated from DB
 */
const getDriverPerformance = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ _id: req.params.id, company: req.companyId, isDeleted: false });
    if (!driver) {
      return errorResponse(res, { message: 'Driver not found', statusCode: 404 });
    }

    const [trips, incidents] = await Promise.all([
      Trip.find({ driver: driver._id, isDeleted: false }),
      Incident.find({ driver: driver._id })
    ]);

    const totalTrips = trips.length;
    const completedTrips = trips.filter(t => t.status === 'COMPLETED').length;
    const delayedTrips = trips.filter(t => t.status === 'DELAYED').length;
    const onTimeRate = completedTrips > 0 
      ? Math.round(((completedTrips - delayedTrips) / completedTrips) * 100) 
      : 0;

    const totalDistance = trips.reduce((acc, t) => acc + (t.distanceKm || 0), 0);

    return successResponse(res, {
      data: {
        driverId: driver._id,
        name: `${driver.firstName} ${driver.lastName}`,
        status: driver.status,
        safetyScore: driver.safetyScore,
        totalTrips,
        completedTrips,
        delayedTrips,
        onTimeRate,
        totalDistanceKm: totalDistance,
        incidentCount: incidents.length
      },
      message: 'Performance metrics calculated'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  getDriverPerformance
};
