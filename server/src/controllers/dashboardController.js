const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Delivery = require('../models/Delivery');
const Maintenance = require('../models/Maintenance');
const FuelRecord = require('../models/FuelRecord');
const Expense = require('../models/Expense');
const Incident = require('../models/Incident');
const { successResponse } = require('../utils/response');

/**
 * Enterprise Dashboard KPIs directly aggregated from MongoDB
 */
const getDashboardKPIs = async (req, res, next) => {
  try {
    const company = req.companyId;

    // Start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      vehicles,
      drivers,
      activeTrips,
      deliveries,
      maintenanceRecords,
      fuelSums,
      expenseSums,
      incidents
    ] = await Promise.all([
      Vehicle.find({ company, isDeleted: false }),
      Driver.find({ company, isDeleted: false }),
      Trip.find({ company, status: { $in: ['ASSIGNED', 'ACCEPTED', 'IN_TRANSIT', 'DELAYED'] }, isDeleted: false }),
      Delivery.find({ company }),
      Maintenance.find({ company }),
      FuelRecord.aggregate([
        { $match: { company } },
        { $group: { _id: null, totalFuelCost: { $sum: '$cost' }, totalLiters: { $sum: '$liters' } } }
      ]),
      Expense.aggregate([
        { $match: { company, status: 'APPROVED' } },
        { $group: { _id: null, totalApprovedExpenses: { $sum: '$amount' } } }
      ]),
      Incident.find({ company, status: { $in: ['REPORTED', 'UNDER_INVESTIGATION'] } })
    ]);

    // Vehicle KPIs
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'IN_TRIP' || v.status === 'ASSIGNED').length;
    const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'MAINTENANCE').length;

    // Driver KPIs
    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter(d => d.status === 'ASSIGNED' || d.status === 'ON_TRIP').length;
    const driversOnTrip = drivers.filter(d => d.status === 'ON_TRIP').length;
    const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE').length;

    // Delivery KPIs
    const totalDeliveries = deliveries.length;
    const todayDeliveries = deliveries.filter(d => new Date(d.createdAt) >= startOfToday).length;
    const completedDeliveries = deliveries.filter(d => d.status === 'DELIVERED').length;
    const delayedDeliveries = deliveries.filter(d => d.status === 'DELAYED').length;
    const deliveryCompletionRate = totalDeliveries > 0 ? Math.round((completedDeliveries / totalDeliveries) * 100) : 0;

    // Maintenance KPIs
    const totalMaintenanceCost = maintenanceRecords
      .filter(m => m.status === 'COMPLETED')
      .reduce((sum, m) => sum + (m.actualCost || m.estimatedCost || 0), 0);

    // Cost calculations
    const fuelCost = fuelSums.length > 0 ? fuelSums[0].totalFuelCost : 0;
    const fuelLiters = fuelSums.length > 0 ? fuelSums[0].totalLiters : 0;
    const approvedExpenses = expenseSums.length > 0 ? expenseSums[0].totalApprovedExpenses : 0;
    const operatingCost = fuelCost + totalMaintenanceCost + approvedExpenses;

    // Fleet Utilization: (Active Vehicles / Total Vehicles) * 100
    const fleetUtilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

    // Recent Live Operations snapshot
    const liveOperations = activeTrips.slice(0, 5).map(t => ({
      _id: t._id,
      tripNumber: t.tripNumber,
      origin: t.origin,
      destination: t.destination,
      status: t.status,
      priority: t.priority,
      scheduledStart: t.scheduledStart
    }));

    return successResponse(res, {
      data: {
        vehicles: {
          total: totalVehicles,
          active: activeVehicles,
          available: availableVehicles,
          inMaintenance: maintenanceVehicles,
          utilizationPercentage: fleetUtilization
        },
        drivers: {
          total: totalDrivers,
          active: activeDrivers,
          onTrip: driversOnTrip,
          available: availableDrivers
        },
        trips: {
          active: activeTrips.length
        },
        deliveries: {
          total: totalDeliveries,
          today: todayDeliveries,
          completed: completedDeliveries,
          delayed: delayedDeliveries,
          completionRate: deliveryCompletionRate
        },
        finance: {
          fuelCost,
          fuelLiters,
          maintenanceCost: totalMaintenanceCost,
          otherExpenses: approvedExpenses,
          totalOperatingCost: operatingCost
        },
        safety: {
          activeIncidents: incidents.length
        },
        liveOperations
      },
      message: 'Dashboard operational metrics calculated'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardKPIs
};
