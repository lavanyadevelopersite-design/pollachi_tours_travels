const { Op } = require('sequelize');
const { Notification } = require('../models');
const AppError = require('../utils/AppError');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const list = async (userId, query = {}) => {
  const { page, limit, offset, sortBy, sortOrder } = getPagination(query);
  const where = { user_id: userId };
  if (query.is_read !== undefined) {
    where.is_read = query.is_read === 'true' || query.is_read === true;
  }

  const { rows, count } = await Notification.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sortBy, sortOrder]],
  });

  return { data: rows, pagination: buildPaginationMeta(count, page, limit) };
};

const create = async (payload) => Notification.create(payload);

const markRead = async (id, userId) => {
  const notification = await Notification.findOne({ where: { id, user_id: userId } });
  if (!notification) throw new AppError('Notification not found', 404);
  await notification.update({ is_read: true });
  return notification;
};

const markAllRead = async (userId) => {
  await Notification.update({ is_read: true }, { where: { user_id: userId, is_read: false } });
  return true;
};

const remove = async (id, userId) => {
  const notification = await Notification.findOne({ where: { id, user_id: userId } });
  if (!notification) throw new AppError('Notification not found', 404);
  await notification.destroy();
  return true;
};

const unreadCount = async (userId) =>
  Notification.count({ where: { user_id: userId, is_read: false } });

module.exports = { list, create, markRead, markAllRead, remove, unreadCount };
