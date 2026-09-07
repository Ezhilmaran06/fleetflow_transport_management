const AuditLog = require('../models/AuditLog');

const logAudit = async ({ actor, actorName, actorEmail, action, module, recordId, previousState, newState, req, company }) => {
  try {
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '';
    const userAgent = req?.headers['user-agent'] || '';

    await AuditLog.create({
      actor: actor || req?.user?._id || null,
      actorName: actorName || `${req?.user?.firstName || ''} ${req?.user?.lastName || ''}`.trim() || 'System',
      actorEmail: actorEmail || req?.user?.email || '',
      action,
      module,
      recordId: String(recordId || ''),
      previousState: previousState ? JSON.parse(JSON.stringify(previousState)) : null,
      newState: newState ? JSON.parse(JSON.stringify(newState)) : null,
      ipAddress,
      userAgent,
      company: company || req?.user?.company
    });
  } catch (err) {
    console.error(`[AuditLog Failure]: ${err.message}`);
  }
};

module.exports = logAudit;
