const User = require('../models/User');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const Setting = require('../models/Setting');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

/**
 * Users Management
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;

    const query = { company: req.companyId, isDeleted: false };
    if (role && role !== 'ALL') query.role = role;
    if (status && status !== 'ALL') query.status = status;

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query)
    ]);

    return successResponse(res, {
      data: users,
      metadata: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) || 1 }
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;
    if (!email || !password || !firstName || !lastName || !role) {
      return errorResponse(res, { message: 'All fields are required', statusCode: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return errorResponse(res, { message: 'A user with this email already exists', statusCode: 409 });
    }

    const user = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash: password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      phone: phone || '',
      company: req.companyId
    });

    await logAudit({
      actor: req.user._id,
      action: 'USER_CREATE',
      module: 'USERS',
      recordId: user._id,
      req,
      company: req.companyId
    });

    return successResponse(res, { data: user, message: 'User created successfully', statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, role, status, phone, password } = req.body;
    const user = await User.findOne({ _id: req.params.id, company: req.companyId, isDeleted: false });

    if (!user) return errorResponse(res, { message: 'User not found', statusCode: 404 });

    const oldState = user.toObject();

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (role) user.role = role;
    if (status) user.status = status;
    if (phone !== undefined) user.phone = phone.trim();
    if (password) user.passwordHash = password; // pre-save will hash

    await user.save();

    await logAudit({
      actor: req.user._id,
      action: 'USER_UPDATE',
      module: 'USERS',
      recordId: user._id,
      previousState: oldState,
      newState: user,
      req,
      company: req.companyId
    });

    return successResponse(res, { data: user, message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, company: req.companyId, isDeleted: false });
    if (!user) return errorResponse(res, { message: 'User not found', statusCode: 404 });

    if (user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, { message: 'You cannot delete your own account', statusCode: 400 });
    }

    user.isDeleted = true;
    await user.save();

    await logAudit({
      actor: req.user._id,
      action: 'USER_DELETE',
      module: 'USERS',
      recordId: user._id,
      req,
      company: req.companyId
    });

    return successResponse(res, { message: 'User deactivated' });
  } catch (error) {
    next(error);
  }
};

/**
 * Roles & Permission Matrix
 */
const getRoles = async (req, res, next) => {
  try {
    let roles = await Role.find({ company: req.companyId });
    
    // Seed standard enterprise roles if none exist for this company
    if (roles.length === 0) {
      const standardRoles = [
        'ADMIN',
        'FLEET_MANAGER',
        'DISPATCHER',
        'DRIVER',
        'OPERATIONS_MANAGER',
        'FINANCE_MANAGER',
        'SAFETY_MANAGER'
      ];

      const seedRoles = standardRoles.map(name => ({
        name,
        company: req.companyId,
        description: `Default system role for ${name.replace('_', ' ')}`
      }));

      roles = await Role.insertMany(seedRoles);
    }

    return successResponse(res, { data: roles });
  } catch (error) {
    next(error);
  }
};

const updateRolePermissions = async (req, res, next) => {
  try {
    const { permissions, description } = req.body;
    const role = await Role.findOne({ _id: req.params.id, company: req.companyId });
    if (!role) return errorResponse(res, { message: 'Role not found', statusCode: 404 });

    if (permissions) role.permissions = permissions;
    if (description) role.description = description;

    await role.save();

    await logAudit({
      actor: req.user._id,
      action: 'ROLE_PERMISSIONS_UPDATE',
      module: 'ROLES',
      recordId: role._id,
      req,
      company: req.companyId
    });

    return successResponse(res, { data: role, message: 'Role permissions saved' });
  } catch (error) {
    next(error);
  }
};

/**
 * Audit Logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { module, action, page = 1, limit = 15 } = req.query;

    const query = { company: req.companyId };
    if (module && module !== 'ALL') query.module = module;
    if (action && action !== 'ALL') query.action = action;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      AuditLog.countDocuments(query)
    ]);

    return successResponse(res, {
      data: logs,
      metadata: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) || 1 }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Settings & Integrations
 */
const getSettings = async (req, res, next) => {
  try {
    let setting = await Setting.findOne({ company: req.companyId });
    if (!setting) {
      setting = await Setting.create({ company: req.companyId });
    }
    return successResponse(res, { data: setting });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const setting = await Setting.findOneAndUpdate(
      { company: req.companyId },
      req.body,
      { new: true, upsert: true }
    );

    await logAudit({
      actor: req.user._id,
      action: 'SETTINGS_UPDATE',
      module: 'SETTINGS',
      recordId: setting._id,
      req,
      company: req.companyId
    });

    return successResponse(res, { data: setting, message: 'Settings updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  updateRolePermissions,
  getAuditLogs,
  getSettings,
  updateSettings
};
