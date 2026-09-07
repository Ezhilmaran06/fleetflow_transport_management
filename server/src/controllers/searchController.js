const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Delivery = require('../models/Delivery');
const Customer = require('../models/Customer');
const Route = require('../models/Route');
const Maintenance = require('../models/Maintenance');
const Document = require('../models/Document');
const User = require('../models/User');
const { successResponse } = require('../utils/response');

/**
 * Enterprise Global Search across all core MongoDB entities
 */
const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return successResponse(res, {
        data: {
          vehicles: [],
          drivers: [],
          trips: [],
          deliveries: [],
          customers: [],
          routes: [],
          maintenance: [],
          documents: [],
          users: []
        },
        message: 'Enter at least 2 characters to search'
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    const company = req.companyId;

    const [
      vehicles,
      drivers,
      trips,
      deliveries,
      customers,
      routes,
      maintenance,
      documents,
      users
    ] = await Promise.all([
      Vehicle.find({
        company,
        isDeleted: false,
        $or: [{ registrationNumber: searchRegex }, { make: searchRegex }, { model: searchRegex }, { vin: searchRegex }]
      }).limit(5).select('registrationNumber make model status type'),

      Driver.find({
        company,
        isDeleted: false,
        $or: [{ firstName: searchRegex }, { lastName: searchRegex }, { licenseNumber: searchRegex }, { phone: searchRegex }]
      }).limit(5).select('firstName lastName licenseNumber phone status'),

      Trip.find({
        company,
        isDeleted: false,
        $or: [{ tripNumber: searchRegex }, { origin: searchRegex }, { destination: searchRegex }]
      }).limit(5).select('tripNumber origin destination status scheduledStart'),

      Delivery.find({
        company,
        $or: [{ trackingNumber: searchRegex }, { pickupAddress: searchRegex }, { dropoffAddress: searchRegex }]
      }).limit(5).select('trackingNumber status pickupAddress dropoffAddress'),

      Customer.find({
        company,
        active: true,
        $or: [{ name: searchRegex }, { contactPerson: searchRegex }, { email: searchRegex }]
      }).limit(5).select('name contactPerson phone'),

      Route.find({
        company,
        active: true,
        $or: [{ name: searchRegex }, { origin: searchRegex }, { destination: searchRegex }]
      }).limit(5).select('name origin destination distanceKm'),

      Maintenance.find({
        company,
        $or: [{ workOrderNumber: searchRegex }, { issueDescription: searchRegex }, { technician: searchRegex }]
      }).limit(5).populate('vehicle', 'registrationNumber').select('workOrderNumber priority status scheduledDate issueDescription'),

      Document.find({
        company,
        $or: [{ title: searchRegex }, { documentNumber: searchRegex }]
      }).limit(5).select('title documentType documentNumber status expiryDate'),

      User.find({
        company,
        isDeleted: false,
        $or: [{ firstName: searchRegex }, { lastName: searchRegex }, { email: searchRegex }]
      }).limit(5).select('firstName lastName email role status')
    ]);

    return successResponse(res, {
      data: {
        vehicles,
        drivers,
        trips,
        deliveries,
        customers,
        routes,
        maintenance,
        documents,
        users
      },
      message: 'Search query results retrieved'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  globalSearch
};
