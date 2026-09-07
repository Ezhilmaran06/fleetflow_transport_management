const Notification = require('../models/Notification');

const createNotification = async ({ recipient, title, message, type = 'SYSTEM', link = '', company }) => {
  try {
    if (!recipient || !company) return;
    await Notification.create({
      recipient,
      title,
      message,
      type,
      link,
      company
    });
  } catch (err) {
    console.error(`[Notification Failure]: ${err.message}`);
  }
};

module.exports = createNotification;
