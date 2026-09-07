const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getAnnouncements,
  createAnnouncement,
  getConversations,
  getMessages,
  sendMessage
} = require('../controllers/communicationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', authorize('ADMIN', 'OPERATIONS_MANAGER'), createAnnouncement);

// Messages
router.get('/conversations', getConversations);
router.get('/messages/:recipientId', getMessages);
router.post('/messages', sendMessage);

module.exports = router;
