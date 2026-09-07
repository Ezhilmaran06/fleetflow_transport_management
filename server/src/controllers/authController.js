const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const Role = require('../models/Role');
const Setting = require('../models/Setting');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fleetflow_super_secret_enterprise_jwt_key_984321', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Register a new company and admin user
 */
const register = async (req, res, next) => {
  try {
    const { companyName, companyCode, firstName, lastName, email, password, phone } = req.body;

    if (!companyName || !email || !password || !firstName || !lastName) {
      return errorResponse(res, {
        message: 'Please provide all required registration fields',
        statusCode: 400,
        errorCode: 'MISSING_FIELDS'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return errorResponse(res, {
        message: 'An account with this email already exists',
        statusCode: 409,
        errorCode: 'EMAIL_EXISTS'
      });
    }

    const generatedCode = (companyCode || companyName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6)).toUpperCase();
    
    // Check or create company
    let company = await Company.findOne({ code: generatedCode });
    if (!company) {
      company = await Company.create({
        name: companyName,
        code: generatedCode,
        email: email.toLowerCase().trim(),
        phone: phone || ''
      });

      // Initialize default settings for company
      await Setting.create({
        company: company._id,
        integrationConfig: {
          gpsConfigured: false,
          mapsConfigured: false,
          emailConfigured: false,
          storageConfigured: true
        }
      });
    }

    // Create Admin User
    const user = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash: password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: 'ADMIN',
      company: company._id,
      phone: phone || ''
    });

    const token = generateToken(user._id);

    await logAudit({
      actor: user._id,
      actorName: `${user.firstName} ${user.lastName}`,
      actorEmail: user.email,
      action: 'USER_REGISTER',
      module: 'AUTH',
      recordId: user._id,
      req,
      company: company._id
    });

    return successResponse(res, {
      data: {
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          company: {
            _id: company._id,
            name: company.name,
            code: company.code
          }
        }
      },
      message: 'Registration successful',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, {
        message: 'Email and password are required',
        statusCode: 400,
        errorCode: 'MISSING_CREDENTIALS'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).populate('company');
    if (!user) {
      return errorResponse(res, {
        message: 'Invalid email or password',
        statusCode: 401,
        errorCode: 'INVALID_CREDENTIALS'
      });
    }

    if (user.status !== 'ACTIVE' || user.isDeleted) {
      return errorResponse(res, {
        message: 'Your account is deactivated or suspended. Please contact your administrator',
        statusCode: 403,
        errorCode: 'ACCOUNT_INACTIVE'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, {
        message: 'Invalid email or password',
        statusCode: 401,
        errorCode: 'INVALID_CREDENTIALS'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    await logAudit({
      actor: user._id,
      actorName: `${user.firstName} ${user.lastName}`,
      actorEmail: user.email,
      action: 'USER_LOGIN',
      module: 'AUTH',
      recordId: user._id,
      req,
      company: user.company._id
    });

    return successResponse(res, {
      data: {
        token,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          company: {
            _id: user.company._id,
            name: user.company.name,
            code: user.company.code
          }
        }
      },
      message: 'Logged in successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('company');
    return successResponse(res, {
      data: user,
      message: 'User profile retrieved'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();

    return successResponse(res, {
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return errorResponse(res, {
        message: 'Current and new password are required',
        statusCode: 400,
        errorCode: 'MISSING_PASSWORDS'
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, {
        message: 'Current password is incorrect',
        statusCode: 400,
        errorCode: 'WRONG_PASSWORD'
      });
    }

    user.passwordHash = newPassword;
    await user.save();

    return successResponse(res, {
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};
