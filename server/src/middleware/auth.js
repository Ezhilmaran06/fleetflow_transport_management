const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, {
      message: 'Not authorized, no authentication token provided',
      statusCode: 401,
      errorCode: 'AUTH_REQUIRED'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fleetflow_super_secret_enterprise_jwt_key_984321');
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return errorResponse(res, {
        message: 'The user belonging to this token no longer exists',
        statusCode: 401,
        errorCode: 'USER_NOT_FOUND'
      });
    }

    if (user.status !== 'ACTIVE' || user.isDeleted) {
      return errorResponse(res, {
        message: 'Your account is deactivated or suspended. Please contact your administrator',
        statusCode: 403,
        errorCode: 'ACCOUNT_INACTIVE'
      });
    }

    req.user = user;
    req.companyId = user.company;
    next();
  } catch (error) {
    return errorResponse(res, {
      message: 'Invalid or expired token',
      statusCode: 401,
      errorCode: 'TOKEN_INVALID'
    });
  }
};

module.exports = { protect };
