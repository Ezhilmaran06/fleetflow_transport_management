const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Delivery = require('../models/Delivery');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');
const createNotification = require('../utils/notificationHelper');

/**
 * Get paginated list of trips
 */
const getTrips = async (req, res, next) => {
  try {
    const { status, driver, vehicle, priority, search, page = 1, limit = 10, sortBy = 'scheduledStart', sortOrder = 'desc' } = req.query;

    const query = { company: req.companyId, isDeleted: false };

    if (status && status !== 'ALL') query.status = status;
    if (priority && priority !== 'ALL') query.priority = priority;
    if (driver) query.driver = driver;
    if (vehicle) query.vehicle = vehicle;

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { tripNumber: searchRegex },
        { origin: searchRegex },
        { destination: searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [trips, total] = await Promise.all([
      Trip.find(query)
        .populate('vehicle', 'registrationNumber make model status fuelLevel')
        .populate('driver', 'firstName lastName phone licenseNumber status safetyScore user')
        .populate('route', 'name distanceKm estimatedMinutes')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Trip.countDocuments(query)
    ]);

    return successResponse(res, {
      data: trips,
      metadata: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      message: 'Trips retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get trip by ID
 */
const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, company: req.companyId, isDeleted: false })
      .populate('vehicle', 'registrationNumber make model year type status mileage fuelLevel')
      .populate('driver', 'firstName lastName phone email licenseNumber status safetyScore')
      .populate('route', 'name origin destination waypoints distanceKm estimatedMinutes');

    if (!trip) {
      return errorResponse(res, {
        message: 'Trip not found',
        statusCode: 404,
        errorCode: 'TRIP_NOT_FOUND'
      });
    }

    const deliveries = await Delivery.find({ trip: trip._id, company: req.companyId })
      .populate('customer', 'name phone address');

    return successResponse(res, {
      data: {
        ...trip.toObject(),
        deliveries
      },
      message: 'Trip details retrieved'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create trip with operational conflict detection
 */
const createTrip = async (req, res, next) => {
  try {
    const {
      tripNumber,
      origin,
      destination,
      vehicleId,
      driverId,
      routeId,
      scheduledStart,
      scheduledEnd,
      distanceKm,
      priority,
      stops,
      notes
    } = req.body;

    if (!origin || !destination || !scheduledStart) {
      return errorResponse(res, {
        message: 'Origin, destination, and scheduled start time are required',
        statusCode: 400,
        errorCode: 'MISSING_FIELDS'
      });
    }

    // Auto-generate or format tripNumber
    let generatedTripNumber = tripNumber 
      ? tripNumber.trim().toUpperCase() 
      : `TRP-${Date.now().toString().slice(-6)}`;

    // Check duplicate tripNumber
    const existing = await Trip.findOne({ tripNumber: generatedTripNumber, company: req.companyId, isDeleted: false });
    if (existing) {
      generatedTripNumber = `TRP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;
    }

    let initialStatus = 'UNASSIGNED';
    let assignedVehicle = null;
    let assignedDriver = null;

    // Validate Vehicle if specified
    if (vehicleId) {
      assignedVehicle = await Vehicle.findOne({ _id: vehicleId, company: req.companyId, isDeleted: false });
      if (!assignedVehicle) {
        return errorResponse(res, { message: 'Specified vehicle not found', statusCode: 404 });
      }

      if (assignedVehicle.status === 'MAINTENANCE') {
        return errorResponse(res, {
          message: `Vehicle ${assignedVehicle.registrationNumber} is in MAINTENANCE and cannot be assigned to a new trip.`,
          statusCode: 422,
          errorCode: 'VEHICLE_IN_MAINTENANCE'
        });
      }

      if (assignedVehicle.status === 'INACTIVE') {
        return errorResponse(res, {
          message: `Vehicle ${assignedVehicle.registrationNumber} is marked INACTIVE`,
          statusCode: 422,
          errorCode: 'VEHICLE_INACTIVE'
        });
      }

      // Check for overlapping active trip
      const vehicleConflict = await Trip.findOne({
        vehicle: vehicleId,
        status: { $in: ['ASSIGNED', 'ACCEPTED', 'IN_TRANSIT'] },
        company: req.companyId,
        isDeleted: false
      });

      if (vehicleConflict) {
        return errorResponse(res, {
          message: `Vehicle ${assignedVehicle.registrationNumber} already has an active or in-transit trip (#${vehicleConflict.tripNumber})`,
          statusCode: 409,
          errorCode: 'VEHICLE_CONFLICT'
        });
      }
    }

    // Validate Driver if specified
    if (driverId) {
      assignedDriver = await Driver.findOne({ _id: driverId, company: req.companyId, isDeleted: false });
      if (!assignedDriver) {
        return errorResponse(res, { message: 'Specified driver not found', statusCode: 404 });
      }

      if (assignedDriver.status === 'SUSPENDED' || assignedDriver.status === 'ON_LEAVE') {
        return errorResponse(res, {
          message: `Driver ${assignedDriver.firstName} ${assignedDriver.lastName} is ${assignedDriver.status} and cannot be assigned`,
          statusCode: 422,
          errorCode: 'DRIVER_INELIGIBLE'
        });
      }

      // Check for overlapping active trip
      const driverConflict = await Trip.findOne({
        driver: driverId,
        status: { $in: ['ASSIGNED', 'ACCEPTED', 'IN_TRANSIT'] },
        company: req.companyId,
        isDeleted: false
      });

      if (driverConflict) {
        return errorResponse(res, {
          message: `Driver ${assignedDriver.firstName} ${assignedDriver.lastName} is already assigned to active trip #${driverConflict.tripNumber}`,
          statusCode: 409,
          errorCode: 'DRIVER_CONFLICT'
        });
      }
    }

    if (assignedVehicle && assignedDriver) {
      initialStatus = 'ASSIGNED';
      assignedVehicle.status = 'ASSIGNED';
      assignedDriver.status = 'ASSIGNED';
      await Promise.all([assignedVehicle.save(), assignedDriver.save()]);
    } else if (assignedVehicle || assignedDriver) {
      initialStatus = 'READY';
    }

    const trip = await Trip.create({
      tripNumber: generatedTripNumber,
      origin: origin.trim(),
      destination: destination.trim(),
      vehicle: vehicleId || null,
      driver: driverId || null,
      route: routeId || null,
      scheduledStart: new Date(scheduledStart),
      scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
      distanceKm: distanceKm ? parseFloat(distanceKm) : 0,
      priority: priority || 'NORMAL',
      status: initialStatus,
      stops: stops || [],
      notes: notes || '',
      company: req.companyId
    });

    // Notify driver if assigned
    if (assignedDriver && assignedDriver.user) {
      await createNotification({
        recipient: assignedDriver.user,
        title: 'New Trip Assigned',
        message: `You have been assigned to Trip #${trip.tripNumber} from ${trip.origin} to ${trip.destination}`,
        type: 'TRIP_ASSIGNED',
        link: `/trips/${trip._id}`,
        company: req.companyId
      });
    }

    await logAudit({
      actor: req.user._id,
      action: 'TRIP_CREATE',
      module: 'DISPATCH',
      recordId: trip._id,
      newState: trip,
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: trip,
      message: 'Trip created successfully',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validated State Machine for Trips
 */
const updateTripStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const trip = await Trip.findOne({ _id: req.params.id, company: req.companyId, isDeleted: false })
      .populate('vehicle')
      .populate('driver');

    if (!trip) {
      return errorResponse(res, { message: 'Trip not found', statusCode: 404 });
    }

    const oldStatus = trip.status;
    const allowedTransitions = {
      UNASSIGNED: ['READY', 'ASSIGNED', 'CANCELLED'],
      READY: ['ASSIGNED', 'UNASSIGNED', 'CANCELLED'],
      ASSIGNED: ['ACCEPTED', 'IN_TRANSIT', 'READY', 'CANCELLED'],
      ACCEPTED: ['IN_TRANSIT', 'CANCELLED'],
      IN_TRANSIT: ['COMPLETED', 'DELAYED', 'CANCELLED'],
      DELAYED: ['IN_TRANSIT', 'COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: []
    };

    if (oldStatus !== status && !allowedTransitions[oldStatus]?.includes(status)) {
      return errorResponse(res, {
        message: `Invalid state transition from '${oldStatus}' to '${status}'`,
        statusCode: 422,
        errorCode: 'INVALID_TRANSITION'
      });
    }

    trip.status = status;
    if (notes) trip.notes = notes;

    // Update timestamps and connected resources
    if (status === 'IN_TRANSIT') {
      if (!trip.actualStart) trip.actualStart = new Date();
      if (trip.vehicle) {
        trip.vehicle.status = 'IN_TRIP';
        await trip.vehicle.save();
      }
      if (trip.driver) {
        trip.driver.status = 'ON_TRIP';
        await trip.driver.save();
      }
    } else if (status === 'COMPLETED') {
      trip.actualEnd = new Date();
      if (trip.vehicle) {
        trip.vehicle.status = 'AVAILABLE';
        trip.vehicle.mileage = (trip.vehicle.mileage || 0) + (trip.distanceKm || 0);
        await trip.vehicle.save();
      }
      if (trip.driver) {
        trip.driver.status = 'AVAILABLE';
        trip.driver.totalTripsCompleted = (trip.driver.totalTripsCompleted || 0) + 1;
        trip.driver.totalDistanceKm = (trip.driver.totalDistanceKm || 0) + (trip.distanceKm || 0);
        await trip.driver.save();
      }
      // Update deliveries on this trip to DELIVERED if not already updated
      await Delivery.updateMany(
        { trip: trip._id, status: { $in: ['PENDING', 'PICKED_UP', 'IN_TRANSIT'] }, company: req.companyId },
        { status: 'DELIVERED', actualDeliveryTime: new Date() }
      );
    } else if (status === 'CANCELLED') {
      if (trip.vehicle && trip.vehicle.status !== 'MAINTENANCE') {
        trip.vehicle.status = 'AVAILABLE';
        await trip.vehicle.save();
      }
      if (trip.driver && trip.driver.status !== 'SUSPENDED') {
        trip.driver.status = 'AVAILABLE';
        await trip.driver.save();
      }
    }

    await trip.save();

    await logAudit({
      actor: req.user._id,
      action: 'TRIP_STATUS_CHANGE',
      module: 'DISPATCH',
      recordId: trip._id,
      previousState: { status: oldStatus },
      newState: { status },
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: trip,
      message: `Trip status updated to ${status}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign vehicle and driver to existing trip
 */
const assignTrip = async (req, res, next) => {
  try {
    const { vehicleId, driverId } = req.body;
    const trip = await Trip.findOne({ _id: req.params.id, company: req.companyId, isDeleted: false });

    if (!trip) {
      return errorResponse(res, { message: 'Trip not found', statusCode: 404 });
    }

    if (vehicleId) {
      const vehicle = await Vehicle.findOne({ _id: vehicleId, company: req.companyId, isDeleted: false });
      if (!vehicle) return errorResponse(res, { message: 'Vehicle not found', statusCode: 404 });
      if (vehicle.status === 'MAINTENANCE') {
        return errorResponse(res, {
          message: `Vehicle is in MAINTENANCE and cannot be assigned`,
          statusCode: 422,
          errorCode: 'VEHICLE_IN_MAINTENANCE'
        });
      }
      trip.vehicle = vehicle._id;
    }

    if (driverId) {
      const driver = await Driver.findOne({ _id: driverId, company: req.companyId, isDeleted: false });
      if (!driver) return errorResponse(res, { message: 'Driver not found', statusCode: 404 });
      if (driver.status === 'SUSPENDED' || driver.status === 'ON_LEAVE') {
        return errorResponse(res, {
          message: `Driver status is '${driver.status}' - ineligible for assignment`,
          statusCode: 422
        });
      }
      trip.driver = driver._id;
    }

    if (trip.vehicle && trip.driver) {
      trip.status = 'ASSIGNED';
    } else if (trip.vehicle || trip.driver) {
      trip.status = 'READY';
    }

    await trip.save();

    await logAudit({
      actor: req.user._id,
      action: 'TRIP_ASSIGNMENT',
      module: 'DISPATCH',
      recordId: trip._id,
      newState: { vehicle: trip.vehicle, driver: trip.driver, status: trip.status },
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: trip,
      message: 'Trip assigned successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete trip (soft delete)
 */
const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, company: req.companyId, isDeleted: false });
    if (!trip) {
      return errorResponse(res, { message: 'Trip not found', statusCode: 404 });
    }

    if (trip.status === 'IN_TRANSIT') {
      return errorResponse(res, {
        message: 'Cannot delete trip that is currently IN_TRANSIT. Please cancel it first.',
        statusCode: 409
      });
    }

    trip.isDeleted = true;
    await trip.save();

    await logAudit({
      actor: req.user._id,
      action: 'TRIP_DELETE',
      module: 'DISPATCH',
      recordId: trip._id,
      req,
      company: req.companyId
    });

    return successResponse(res, { message: 'Trip removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTripStatus,
  assignTrip,
  deleteTrip
};
