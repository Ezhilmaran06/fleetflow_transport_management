const { errorResponse } = require('../utils/response');

/**
 * Restrict to specific roles
 * @param  {...string} roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, {
        message: 'Authentication required before checking permissions',
        statusCode: 401,
        errorCode: 'UNAUTHENTICATED'
      });
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, {
        message: `Role '${req.user.role}' is not authorized to perform this operation`,
        statusCode: 403,
        errorCode: 'FORBIDDEN'
      });
    }

    next();
  };
};

/**
 * Check fine-grained module & action permission
 */
const checkPermission = (moduleName, action) => {
  return async (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, {
        message: 'Authentication required',
        statusCode: 401,
        errorCode: 'UNAUTHENTICATED'
      });
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Role-based baseline permissions
    const roleDefaults = {
      FLEET_MANAGER: {
        vehicles: ['view', 'create', 'edit', 'delete', 'assign', 'export', 'manage'],
        drivers: ['view', 'create', 'edit', 'assign', 'export'],
        maintenance: ['view', 'create', 'edit', 'approve', 'assign', 'manage'],
        fuel: ['view', 'create', 'export'],
        documents: ['view', 'create', 'edit', 'delete', 'export'],
        dashboard: ['view']
      },
      DISPATCHER: {
        trips: ['view', 'create', 'edit', 'delete', 'assign', 'export', 'manage'],
        deliveries: ['view', 'create', 'edit', 'assign', 'export'],
        routes: ['view', 'create', 'edit'],
        customers: ['view', 'create', 'edit'],
        vehicles: ['view'],
        drivers: ['view'],
        dashboard: ['view']
      },
      DRIVER: {
        trips: ['view', 'edit'],
        deliveries: ['view', 'edit'],
        fuel: ['view', 'create'],
        expenses: ['view', 'create'],
        safety: ['view', 'create'],
        dashboard: ['view']
      },
      OPERATIONS_MANAGER: {
        trips: ['view', 'create', 'edit', 'assign', 'export'],
        deliveries: ['view', 'create', 'edit', 'export'],
        vehicles: ['view'],
        drivers: ['view'],
        safety: ['view', 'create', 'edit'],
        analytics: ['view', 'export'],
        dashboard: ['view']
      },
      FINANCE_MANAGER: {
        fuel: ['view', 'create', 'edit', 'export'],
        expenses: ['view', 'create', 'edit', 'approve', 'export', 'manage'],
        budgets: ['view', 'create', 'edit', 'delete', 'manage'],
        analytics: ['view', 'export'],
        reports: ['view', 'create', 'export'],
        dashboard: ['view']
      },
      SAFETY_MANAGER: {
        safety: ['view', 'create', 'edit', 'delete', 'manage'],
        drivers: ['view'],
        vehicles: ['view'],
        documents: ['view', 'create', 'edit', 'export'],
        analytics: ['view'],
        dashboard: ['view']
      }
    };

    const userRole = req.user.role;
    const allowedActions = roleDefaults[userRole]?.[moduleName] || [];

    if (allowedActions.includes(action) || allowedActions.includes('manage')) {
      return next();
    }

    return errorResponse(res, {
      message: `Permission denied: '${action}' on '${moduleName}' requires higher clearance`,
      statusCode: 403,
      errorCode: 'PERMISSION_DENIED'
    });
  };
};

module.exports = {
  authorize,
  checkPermission
};
