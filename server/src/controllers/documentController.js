const Document = require('../models/Document');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');
const fs = require('fs');
const path = require('path');

const getDocuments = async (req, res, next) => {
  try {
    const { ownerType, ownerId, documentType, status, page = 1, limit = 10 } = req.query;

    const query = { company: req.companyId };
    if (ownerType && ownerType !== 'ALL') query.ownerType = ownerType;
    if (ownerId) query.ownerId = ownerId;
    if (documentType && documentType !== 'ALL') query.documentType = documentType;
    if (status && status !== 'ALL') query.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [docs, total] = await Promise.all([
      Document.find(query).sort({ expiryDate: 1 }).skip(skip).limit(limitNum),
      Document.countDocuments(query)
    ]);

    return successResponse(res, {
      data: docs,
      metadata: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      message: 'Documents retrieved'
    });
  } catch (error) {
    next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, { message: 'Document file is required', statusCode: 400 });
    }

    const { title, documentType, ownerType, ownerId, documentNumber, issueDate, expiryDate, notes } = req.body;

    if (!title || !documentType || !ownerType || !ownerId || !expiryDate) {
      return errorResponse(res, {
        message: 'Title, document type, owner type, owner ID, and expiry date are required',
        statusCode: 400
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const doc = await Document.create({
      title: title.trim(),
      documentType,
      ownerType,
      ownerId,
      documentNumber: documentNumber ? documentNumber.trim() : '',
      issueDate: issueDate ? new Date(issueDate) : undefined,
      expiryDate: new Date(expiryDate),
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      notes: notes || '',
      company: req.companyId
    });

    await logAudit({
      actor: req.user._id,
      action: 'DOCUMENT_UPLOAD',
      module: 'DOCUMENTS',
      recordId: doc._id,
      newState: doc,
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: doc,
      message: 'Document uploaded and registered',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, company: req.companyId });
    if (!doc) return errorResponse(res, { message: 'Document not found', statusCode: 404 });

    // Try deleting physical file if local
    try {
      const filePath = path.join(__dirname, '../../', doc.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error('File cleanup error:', e.message);
    }

    await logAudit({
      actor: req.user._id,
      action: 'DOCUMENT_DELETE',
      module: 'DOCUMENTS',
      recordId: doc._id,
      req,
      company: req.companyId
    });

    return successResponse(res, { message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocuments,
  uploadDocument,
  deleteDocument
};
