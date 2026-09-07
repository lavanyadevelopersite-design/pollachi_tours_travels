const { Op } = require('sequelize');
const { User, Role, Permission } = require('../models');
const notificationService = require('./notification.service');

/**
 * Channel-ready enquiry notifications.
 * Currently: in-app CRM. Future: email / SMS / WhatsApp hooks.
 */
const notifyChannels = {
  inApp: async ({ userId, title, message, link, metadata }) =>
    notificationService.create({
      user_id: userId,
      title,
      message,
      type: 'info',
      link: link || null,
      metadata: metadata || null,
    }),

  email: async () => {
    // Future: integrate email provider
    return null;
  },

  sms: async () => {
    // Future: integrate SMS provider
    return null;
  },

  whatsapp: async () => {
    // Future: integrate WhatsApp provider
    return null;
  },
};

const resolveNotifyUsers = async () => {
  const users = await User.findAll({
    where: { is_active: true },
    include: [
      {
        model: Role,
        as: 'role',
        include: [{ model: Permission, as: 'permissions', attributes: ['code'] }],
      },
    ],
    attributes: ['id', 'email', 'first_name', 'last_name', 'phone'],
  });

  return users.filter((u) => {
    const code = u.role?.code;
    if (code === 'super_admin') return true;
    const perms = (u.role?.permissions || []).map((p) => p.code);
    return perms.includes('enquiries.view') || perms.includes('leads.view');
  });
};

const notifyNewEnquiry = async (enquiry) => {
  const users = await resolveNotifyUsers();
  const title = 'New Enquiry Received';
  const message = `Enquiry ${enquiry.enquiry_code} from ${enquiry.customer_name} has been submitted.`;
  const link = `/enquiry/view/${enquiry.id}`;
  const metadata = {
    enquiry_id: enquiry.id,
    enquiry_code: enquiry.enquiry_code,
    channels: ['inApp'],
  };

  await Promise.all(
    users.map(async (user) => {
      await notifyChannels.inApp({
        userId: user.id,
        title,
        message,
        link,
        metadata,
      });
      // Future hooks (no-op today)
      await notifyChannels.email({ user, enquiry, title, message });
      await notifyChannels.sms({ user, enquiry, title, message });
      await notifyChannels.whatsapp({ user, enquiry, title, message });
    })
  );

  return { notified: users.length };
};

module.exports = {
  notifyNewEnquiry,
  notifyChannels,
};
