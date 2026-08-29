const notificationService = require('../services/notification.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await notificationService.list(req.user.id, req.query);
  res.json(ApiResponse.paginated('Notifications retrieved', result.data, result.pagination));
});

const unreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.unreadCount(req.user.id);
  res.json(ApiResponse.success('Unread count retrieved', { count }));
});

const markRead = asyncHandler(async (req, res) => {
  const data = await notificationService.markRead(req.params.id, req.user.id);
  res.json(ApiResponse.success('Notification marked as read', data));
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user.id);
  res.json(ApiResponse.success('All notifications marked as read'));
});

const remove = asyncHandler(async (req, res) => {
  await notificationService.remove(req.params.id, req.user.id);
  res.json(ApiResponse.success('Notification deleted'));
});

const create = asyncHandler(async (req, res) => {
  const data = await notificationService.create(req.body);
  res.status(201).json(ApiResponse.success('Notification created', data));
});

module.exports = { list, unreadCount, markRead, markAllRead, remove, create };
