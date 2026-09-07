const Notification = require('../models/Notification');
const Message = require('../models/Message');
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

/**
 * Notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
      company: req.companyId
    }).sort({ createdAt: -1 }).limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      company: req.companyId,
      isRead: false
    });

    return successResponse(res, {
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    return successResponse(res, { message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, company: req.companyId, isRead: false },
      { isRead: true }
    );
    return successResponse(res, { message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * Announcements
 */
const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find({
      company: req.companyId,
      status: 'PUBLISHED'
    })
      .populate('author', 'firstName lastName role')
      .sort({ createdAt: -1 });

    return successResponse(res, { data: announcements });
  } catch (error) {
    next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, audience, priority } = req.body;
    if (!title || !message) {
      return errorResponse(res, { message: 'Title and message are required', statusCode: 400 });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      audience: audience || 'ALL',
      priority: priority || 'NORMAL',
      author: req.user._id,
      company: req.companyId
    });

    // Notify users in company
    const users = await User.find({ company: req.companyId, status: 'ACTIVE' });
    const notificationPromises = users.map(u =>
      Notification.create({
        recipient: u._id,
        title: `Announcement: ${announcement.title}`,
        message: announcement.message.slice(0, 100) + '...',
        type: 'SYSTEM',
        link: '/announcements',
        company: req.companyId
      })
    );
    await Promise.all(notificationPromises);

    await logAudit({
      actor: req.user._id,
      action: 'ANNOUNCEMENT_CREATE',
      module: 'COMMUNICATION',
      recordId: announcement._id,
      req,
      company: req.companyId
    });

    return successResponse(res, {
      data: announcement,
      message: 'Announcement published successfully',
      statusCode: 201
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Real Direct Messages
 */
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all users in company to chat with
    const users = await User.find({
      company: req.companyId,
      _id: { $ne: userId },
      status: 'ACTIVE'
    }).select('firstName lastName email role');

    return successResponse(res, { data: users });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { recipientId } = req.params;
    const userId = req.user._id;

    const conversationId = [userId.toString(), recipientId.toString()].sort().join('_');

    const messages = await Message.find({
      conversationId,
      company: req.companyId
    }).sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { conversationId, recipient: userId, isRead: false },
      { isRead: true }
    );

    return successResponse(res, { data: messages });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, content } = req.body;
    if (!recipientId || !content) {
      return errorResponse(res, { message: 'Recipient and content are required', statusCode: 400 });
    }

    const userId = req.user._id;
    const conversationId = [userId.toString(), recipientId.toString()].sort().join('_');

    const message = await Message.create({
      conversationId,
      sender: userId,
      recipient: recipientId,
      content: content.trim(),
      company: req.companyId
    });

    return successResponse(res, { data: message, message: 'Message sent', statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAnnouncements,
  createAnnouncement,
  getConversations,
  getMessages,
  sendMessage
};
