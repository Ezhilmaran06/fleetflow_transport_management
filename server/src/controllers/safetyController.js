const Incident = require('../models/Incident');
const Document = require('../models/Document');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');
const createNotification = require('../utils/notificationHelper');

const getIncidents = async (req, res, next) => {
  try {
    const { severity, status, page = 1, limit = 10, sortBy = 'incidentDate', sortOrder = 'desc' } = req.query;

    const query = { company: req.companyId };
    if (severity && severity !== 'ALL') query.severity = severity;
    if (status && status !== 'ALL') query.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [incidents, total] = await Promise.all([
      Incident.find(query)
        .populate('vehicle', 'registrationNumber make model')
        .populate('driver', 'firstName lastName phone')
        .populate('reportedBy', 'firstName lastName')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Incident.countDocuments(query)
    ]);

    return successResponse(res, {
      data: incidents,
      metadata: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      message: 'Incidents retrieved'
    });
  } catch (error) {
    next(error);
  }
};

const getIncidentById = async (req, res, next) => {
  try {
    const incident = await Incident.findOne({ _id: req.params.id, company: req.companyId })
      .populate('vehicle', 'registrationNumber make model year')
      .populate('driver', 'firstName lastName phone licenseNumber')
      .populate('trip', 'tripNumber origin destination')
      .populate('reportedBy', 'firstName lastName email');

    if (!incident) return errorResponse(res, { message: 'Incident not found', statusCode: 404 });
    return successResponse(res, { data: incident });
  } catch (error) {
    next(error);
  }
};

const createIncident = async (req, res, next) => {
  try {
    const { title, vehicleId, driverId, tripId, severity, incidentDate, location, description, actionTaken } = req.body;

    if (!title || !location || !description) {
      return errorResponse(res, { message: 'Title, location, and description are required', statusCode: 400 });
    }

    const incidentNumber = `INC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;

    const incident = await Incident.create({
      incidentNumber,
      title: title.trim(),
      vehicle: vehicleId || null,
      driver: driverId || null,
      trip: tripId || null,
      severity: severity || 'MEDIUM',
      incidentDate: incidentDate ? new Date(incidentDate) : new Date(),
      location: location.trim(),
      description: description.trim(),
      actionTaken: actionTaken || '',
      reportedBy: req.user._id,
      company: req.companyId
    });

    await logAudit({
      actor: req.user._id,
      action: 'INCIDENT_REPORT',
      module: 'SAFETY',
      recordId: incident._id,
      newState: incident,
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: incident,
      message: 'Incident reported successfully',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

const updateIncidentStatus = async (req, res, next) => {
  try {
    const { status, actionTaken, resolutionNotes } = req.body;
    const incident = await Incident.findOne({ _id: req.params.id, company: req.companyId });
    if (!incident) return errorResponse(res, { message: 'Incident not found', statusCode: 404 });

    const oldStatus = incident.status;
    if (status) incident.status = status;
    if (actionTaken) incident.actionTaken = actionTaken;
    if (resolutionNotes) incident.resolutionNotes = resolutionNotes;

    await incident.save();

    await logAudit({
      actor: req.user._id,
      action: 'INCIDENT_UPDATE',
      module: 'SAFETY',
      recordId: incident._id,
      previousState: { status: oldStatus },
      newState: { status: incident.status, resolutionNotes },
      req,
      company: req.companyId
    });

    return successResponse(res, { data: incident, message: 'Incident updated' });
  } catch (error) {
    next(error);
  }
};

/**
 * Real compliance overview calculated from actual Document records
 */
const getComplianceOverview = async (req, res, next) => {
  try {
    const docs = await Document.find({ company: req.companyId });

    const now = new Date();
    let validCount = 0;
    let expiringCount = 0;
    let expiredCount = 0;

    docs.forEach(doc => {
      const diffDays = Math.ceil((new Date(doc.expiryDate) - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        expiredCount++;
      } else if (diffDays <= 30) {
        expiringCount++;
      } else {
        validCount++;
      }
    });

    const totalDocs = docs.length;
    const complianceRate = totalDocs > 0 ? Math.round((validCount / totalDocs) * 100) : 100;

    return successResponse(res, {
      data: {
        totalDocuments: totalDocs,
        valid: validCount,
        expiringSoon: expiringCount,
        expired: expiredCount,
        complianceRate
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncidentStatus,
  getComplianceOverview
};
