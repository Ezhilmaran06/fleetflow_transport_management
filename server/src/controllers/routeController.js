const Route = require('../models/Route');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

const getRoutes = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { company: req.companyId, active: true };

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { origin: regex }, { destination: regex }];
    }

    const routes = await Route.find(query).sort({ name: 1 });
    return successResponse(res, { data: routes });
  } catch (error) {
    next(error);
  }
};

const createRoute = async (req, res, next) => {
  try {
    const { name, origin, destination, distanceKm, estimatedMinutes, waypoints } = req.body;
    if (!name || !origin || !destination || distanceKm === undefined || estimatedMinutes === undefined) {
      return errorResponse(res, { message: 'Name, origin, destination, distance, and duration are required', statusCode: 400 });
    }

    const route = await Route.create({
      name: name.trim(),
      origin: origin.trim(),
      destination: destination.trim(),
      distanceKm: parseFloat(distanceKm),
      estimatedMinutes: parseInt(estimatedMinutes, 10),
      waypoints: waypoints || [],
      company: req.companyId
    });

    await logAudit({
      actor: req.user._id,
      action: 'ROUTE_CREATE',
      module: 'ROUTES',
      recordId: route._id,
      req,
      company: req.companyId
    });

    return successResponse(res, { data: route, message: 'Route created', statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

const updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findOneAndUpdate({ _id: req.params.id, company: req.companyId }, req.body, { new: true });
    if (!route) return errorResponse(res, { message: 'Route not found', statusCode: 404 });
    return successResponse(res, { data: route, message: 'Route updated' });
  } catch (error) {
    next(error);
  }
};

const deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findOneAndUpdate({ _id: req.params.id, company: req.companyId }, { active: false }, { new: true });
    if (!route) return errorResponse(res, { message: 'Route not found', statusCode: 404 });
    return successResponse(res, { message: 'Route deactivated' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute
};
