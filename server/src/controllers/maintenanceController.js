const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');
const createNotification = require('../utils/notificationHelper');

/**
 * Get paginated list of maintenance work orders
 */
const getMaintenanceList = async (req, res, next) => {
  try {
    const { status, vehicleId, priority, serviceType, page = 1, limit = 10, sortBy = 'scheduledDate', sortOrder = 'desc' } = req.query;

    const query = { company: req.companyId };

    if (status && status !== 'ALL') query.status = status;
    if (priority && priority !== 'ALL') query.priority = priority;
    if (serviceType && serviceType !== 'ALL') query.serviceType = serviceType;
    if (vehicleId) query.vehicle = vehicleId;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [workOrders, total] = await Promise.all([
      Maintenance.find(query)
        .populate('vehicle', 'registrationNumber make model year mileage status')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Maintenance.countDocuments(query)
    ]);

    return successResponse(res, {
      data: workOrders,
      metadata: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      message: 'Maintenance records retrieved'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get work order by ID
 */
const getMaintenanceById = async (req, res, next) => {
  try {
    const workOrder = await Maintenance.findOne({ _id: req.params.id, company: req.companyId })
      .populate('vehicle', 'registrationNumber make model year mileage fuelLevel status assignedDriver');

    if (!workOrder) {
      return errorResponse(res, { message: 'Maintenance record not found', statusCode: 404 });
    }

    return successResponse(res, { data: workOrder });
  } catch (error) {
    next(error);
  }
};

/**
 * Create maintenance work order
 */
const createWorkOrder = async (req, res, next) => {
  try {
    const {
      vehicleId,
      issueDescription,
      priority,
      serviceType,
      technician,
      scheduledDate,
      estimatedCost,
      notes
    } = req.body;

    if (!vehicleId || !issueDescription || !scheduledDate) {
      return errorResponse(res, {
        message: 'Vehicle, issue description, and scheduled date are required',
        statusCode: 400
      });
    }

    const vehicle = await Vehicle.findOne({ _id: vehicleId, company: req.companyId, isDeleted: false });
    if (!vehicle) {
      return errorResponse(res, { message: 'Vehicle not found', statusCode: 404 });
    }

    const workOrderNumber = `WO-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;

    const workOrder = await Maintenance.create({
      workOrderNumber,
      vehicle: vehicleId,
      issueDescription: issueDescription.trim(),
      priority: priority || 'MEDIUM',
      serviceType: serviceType || 'ROUTINE',
      technician: technician || '',
      scheduledDate: new Date(scheduledDate),
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : 0,
      notes: notes || '',
      company: req.companyId
    });

    await logAudit({
      actor: req.user._id,
      action: 'MAINTENANCE_CREATE',
      module: 'MAINTENANCE',
      recordId: workOrder._id,
      newState: workOrder,
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: workOrder,
      message: 'Work order created successfully',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update work order status and transition vehicle state
 */
const updateWorkOrderStatus = async (req, res, next) => {
  try {
    const { status, actualCost, notes, technician } = req.body;
    const workOrder = await Maintenance.findOne({ _id: req.params.id, company: req.companyId })
      .populate('vehicle');

    if (!workOrder) {
      return errorResponse(res, { message: 'Work order not found', statusCode: 404 });
    }

    const oldStatus = workOrder.status;
    workOrder.status = status;
    if (actualCost !== undefined) workOrder.actualCost = parseFloat(actualCost);
    if (notes) workOrder.notes = notes;
    if (technician) workOrder.technician = technician;

    // Vehicle state machine synchronization
    const vehicle = await Vehicle.findById(workOrder.vehicle._id);
    if (vehicle) {
      if (['IN_PROGRESS', 'APPROVED', 'ASSIGNED'].includes(status)) {
        vehicle.status = 'MAINTENANCE';
        await vehicle.save();
      } else if (['COMPLETED', 'CANCELLED'].includes(status)) {
        if (status === 'COMPLETED') workOrder.completedDate = new Date();
        // Check if there is another active maintenance on this vehicle
        const otherActive = await Maintenance.findOne({
          vehicle: vehicle._id,
          _id: { $ne: workOrder._id },
          status: { $in: ['IN_PROGRESS', 'APPROVED', 'ASSIGNED'] },
          company: req.companyId
        });
        if (!otherActive && vehicle.status === 'MAINTENANCE') {
          vehicle.status = 'AVAILABLE';
          await vehicle.save();
        }
      }
    }

    await workOrder.save();

    await logAudit({
      actor: req.user._id,
      action: 'MAINTENANCE_STATUS_UPDATE',
      module: 'MAINTENANCE',
      recordId: workOrder._id,
      previousState: { status: oldStatus },
      newState: { status, vehicleStatus: vehicle?.status },
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: workOrder,
      message: `Work order status updated to ${status}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete work order
 */
const deleteWorkOrder = async (req, res, next) => {
  try {
    const workOrder = await Maintenance.findOneAndDelete({ _id: req.params.id, company: req.companyId });
    if (!workOrder) return errorResponse(res, { message: 'Work order not found', statusCode: 404 });

    await logAudit({
      actor: req.user._id,
      action: 'MAINTENANCE_DELETE',
      module: 'MAINTENANCE',
      recordId: workOrder._id,
      req,
      company: req.companyId
    });

    return successResponse(res, { message: 'Work order deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaintenanceList,
  getMaintenanceById,
  createWorkOrder,
  updateWorkOrderStatus,
  deleteWorkOrder
};
