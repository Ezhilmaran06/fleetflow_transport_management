const Delivery = require('../models/Delivery');
const Customer = require('../models/Customer');
const Trip = require('../models/Trip');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

/**
 * Get paginated list of deliveries
 */
const getDeliveries = async (req, res, next) => {
  try {
    const { status, tripId, customerId, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = { company: req.companyId };

    if (status && status !== 'ALL') query.status = status;
    if (tripId) query.trip = tripId;
    if (customerId) query.customer = customerId;

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { trackingNumber: searchRegex },
        { pickupAddress: searchRegex },
        { dropoffAddress: searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [deliveries, total] = await Promise.all([
      Delivery.find(query)
        .populate('customer', 'name phone email contactPerson')
        .populate({
          path: 'trip',
          select: 'tripNumber origin destination status vehicle driver',
          populate: [
            { path: 'vehicle', select: 'registrationNumber make model' },
            { path: 'driver', select: 'firstName lastName phone' }
          ]
        })
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Delivery.countDocuments(query)
    ]);

    return successResponse(res, {
      data: deliveries,
      metadata: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      message: 'Deliveries retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get delivery by ID
 */
const getDeliveryById = async (req, res, next) => {
  try {
    const delivery = await Delivery.findOne({ _id: req.params.id, company: req.companyId })
      .populate('customer', 'name phone email contactPerson address city')
      .populate({
        path: 'trip',
        select: 'tripNumber origin destination status scheduledStart scheduledEnd actualStart actualEnd vehicle driver',
        populate: [
          { path: 'vehicle', select: 'registrationNumber make model year type' },
          { path: 'driver', select: 'firstName lastName phone licenseNumber' }
        ]
      });

    if (!delivery) {
      return errorResponse(res, { message: 'Delivery not found', statusCode: 404 });
    }

    return successResponse(res, {
      data: delivery,
      message: 'Delivery details retrieved'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create delivery
 */
const createDelivery = async (req, res, next) => {
  try {
    const {
      customerId,
      tripId,
      pickupAddress,
      dropoffAddress,
      packageDescription,
      weightKg,
      pieces,
      estimatedDeliveryTime
    } = req.body;

    if (!customerId || !pickupAddress || !dropoffAddress) {
      return errorResponse(res, {
        message: 'Customer, pickup address, and dropoff address are required',
        statusCode: 400
      });
    }

    const customer = await Customer.findOne({ _id: customerId, company: req.companyId });
    if (!customer) {
      return errorResponse(res, { message: 'Customer not found', statusCode: 404 });
    }

    const trackingNumber = `DEL-${Date.now().toString().slice(-7)}-${Math.floor(Math.random() * 100)}`;

    const delivery = await Delivery.create({
      trackingNumber,
      customer: customerId,
      trip: tripId || null,
      pickupAddress: pickupAddress.trim(),
      dropoffAddress: dropoffAddress.trim(),
      packageDetails: {
        description: packageDescription || '',
        weightKg: weightKg ? parseFloat(weightKg) : 0,
        pieces: pieces ? parseInt(pieces, 10) : 1
      },
      estimatedDeliveryTime: estimatedDeliveryTime ? new Date(estimatedDeliveryTime) : null,
      company: req.companyId
    });

    await logAudit({
      actor: req.user._id,
      action: 'DELIVERY_CREATE',
      module: 'DELIVERIES',
      recordId: delivery._id,
      newState: delivery,
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: delivery,
      message: 'Delivery scheduled successfully',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update delivery status
 */
const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const delivery = await Delivery.findOne({ _id: req.params.id, company: req.companyId });

    if (!delivery) {
      return errorResponse(res, { message: 'Delivery not found', statusCode: 404 });
    }

    const oldStatus = delivery.status;
    delivery.status = status;
    if (status === 'DELIVERED') {
      delivery.actualDeliveryTime = new Date();
    }

    await delivery.save();

    await logAudit({
      actor: req.user._id,
      action: 'DELIVERY_STATUS_UPDATE',
      module: 'DELIVERIES',
      recordId: delivery._id,
      previousState: { status: oldStatus },
      newState: { status },
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: delivery,
      message: `Delivery status updated to ${status}`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload proof of delivery (Multer)
 */
const uploadProofOfDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findOne({ _id: req.params.id, company: req.companyId });
    if (!delivery) {
      return errorResponse(res, { message: 'Delivery not found', statusCode: 404 });
    }

    if (!req.file) {
      return errorResponse(res, { message: 'Proof document or image file is required', statusCode: 400 });
    }

    const { signedBy, notes } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;

    delivery.proofOfDelivery = {
      fileUrl,
      signedBy: signedBy || req.user.firstName + ' ' + req.user.lastName,
      notes: notes || '',
      timestamp: new Date()
    };
    delivery.status = 'DELIVERED';
    delivery.actualDeliveryTime = new Date();

    await delivery.save();

    await logAudit({
      actor: req.user._id,
      action: 'DELIVERY_POD_UPLOAD',
      module: 'DELIVERIES',
      recordId: delivery._id,
      newState: delivery.proofOfDelivery,
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: delivery,
      message: 'Proof of delivery uploaded and verified'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete delivery
 */
const deleteDelivery = async (req, res, next) => {
  try {
    const delivery = await Delivery.findOneAndDelete({ _id: req.params.id, company: req.companyId });
    if (!delivery) {
      return errorResponse(res, { message: 'Delivery not found', statusCode: 404 });
    }

    await logAudit({
      actor: req.user._id,
      action: 'DELIVERY_DELETE',
      module: 'DELIVERIES',
      recordId: delivery._id,
      req,
      company: req.companyId
    });

    return successResponse(res, { message: 'Delivery deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDeliveries,
  getDeliveryById,
  createDelivery,
  updateDeliveryStatus,
  uploadProofOfDelivery,
  deleteDelivery
};
