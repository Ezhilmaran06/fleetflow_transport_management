const Customer = require('../models/Customer');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

const getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { company: req.companyId, active: true };

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { contactPerson: regex }, { email: regex }, { phone: regex }];
    }

    const customers = await Customer.find(query).sort({ name: 1 });
    return successResponse(res, { data: customers });
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const { name, code, contactPerson, email, phone, address, city } = req.body;
    if (!name) return errorResponse(res, { message: 'Customer name is required', statusCode: 400 });

    const customer = await Customer.create({
      name: name.trim(),
      code: code || '',
      contactPerson: contactPerson || '',
      email: email || '',
      phone: phone || '',
      address: address || '',
      city: city || '',
      company: req.companyId
    });

    await logAudit({
      actor: req.user._id,
      action: 'CUSTOMER_CREATE',
      module: 'CUSTOMERS',
      recordId: customer._id,
      req,
      company: req.companyId
    });

    return successResponse(res, { data: customer, message: 'Customer created', statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, company: req.companyId },
      req.body,
      { new: true }
    );
    if (!customer) return errorResponse(res, { message: 'Customer not found', statusCode: 404 });
    return successResponse(res, { data: customer, message: 'Customer updated' });
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, company: req.companyId },
      { active: false },
      { new: true }
    );
    if (!customer) return errorResponse(res, { message: 'Customer not found', statusCode: 404 });
    return successResponse(res, { message: 'Customer deactivated' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
