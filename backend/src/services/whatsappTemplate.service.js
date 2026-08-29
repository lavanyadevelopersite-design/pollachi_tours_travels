const { Op } = require('sequelize');
const { LeadStatus, LeadStatusWhatsAppTemplate } = require('../models');
const AppError = require('../utils/AppError');

const serializeTemplate = (row) => {
  if (!row) return null;
  const data = row.toJSON ? row.toJSON() : row;
  return {
    id: data.id,
    lead_status_id: data.lead_status_id || null,
    template_name: data.template_name || '',
    template_content: data.template_content || data.message_notes || '',
    language_code: data.language_code || 'en_US',
    include_itinerary: Boolean(data.include_itinerary),
    header_media_url: data.header_media_url || null,
    is_active: data.is_active !== false,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

const listAll = async () => {
  const rows = await LeadStatusWhatsAppTemplate.findAll({
    order: [['created_at', 'DESC']],
  });
  return rows.map(serializeTemplate);
};

const getById = async (id) => {
  const row = await LeadStatusWhatsAppTemplate.findByPk(id);
  if (!row) throw new AppError('WhatsApp template not found', 404);
  return serializeTemplate(row);
};

const getByTemplateName = async (name) => {
  const trimmed = String(name || '').trim();
  if (!trimmed) return null;

  const row = await LeadStatusWhatsAppTemplate.findOne({
    where: {
      template_name: trimmed,
      is_active: true,
    },
  });
  if (row) return serializeTemplate(row);

  const fuzzy = await LeadStatusWhatsAppTemplate.findOne({
    where: {
      template_name: { [Op.like]: `%${trimmed}%` },
      is_active: true,
    },
  });
  return serializeTemplate(fuzzy);
};

const getByLeadStatusId = async (leadStatusId) => {
  const row = await LeadStatusWhatsAppTemplate.findOne({
    where: { lead_status_id: leadStatusId },
  });
  return serializeTemplate(row);
};

const getByLeadStatusName = async (statusName) => {
  const name = String(statusName || '').trim();
  if (!name) return null;

  const byTemplateName = await getByTemplateName(name);
  if (byTemplateName) return byTemplateName;

  const status = await LeadStatus.findOne({
    where: {
      is_active: true,
      lead_status: { [Op.like]: `%${name}%` },
    },
  });
  if (!status) return null;
  return getByLeadStatusId(status.id);
};

const buildCreatePayload = (payload, userId = null) => ({
  lead_status_id: payload.lead_status_id || null,
  template_name: String(payload.template_name || '').trim(),
  template_content: String(payload.template_content || '').trim(),
  language_code: 'en_US',
  include_itinerary: false,
  header_media_url: null,
  message_notes: null,
  is_active: payload.is_active !== false,
  created_by: userId,
  updated_by: userId,
});

const ensureUniqueName = async (templateName, excludeId = null) => {
  const where = { template_name: templateName };
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }
  const existing = await LeadStatusWhatsAppTemplate.findOne({ where });
  if (existing) {
    throw new AppError('A template with this name already exists', 409);
  }
};

const create = async (payload, userId = null) => {
  const templateName = String(payload.template_name || '').trim();
  if (!templateName) throw new AppError('Template name is required', 400);

  await ensureUniqueName(templateName);

  const row = await LeadStatusWhatsAppTemplate.create(buildCreatePayload(payload, userId));
  return serializeTemplate(row);
};

const update = async (id, payload, userId = null) => {
  const row = await LeadStatusWhatsAppTemplate.findByPk(id);
  if (!row) throw new AppError('WhatsApp template not found', 404);

  const updates = { updated_by: userId };

  if (payload.template_content !== undefined) {
    updates.template_content = String(payload.template_content || '').trim();
  }
  if (payload.is_active !== undefined) {
    updates.is_active = Boolean(payload.is_active);
  }

  await row.update(updates);
  return serializeTemplate(row);
};

const updateActiveStatus = async (id, isActive, userId = null) => {
  const row = await LeadStatusWhatsAppTemplate.findByPk(id);
  if (!row) throw new AppError('WhatsApp template not found', 404);
  await row.update({
    is_active: Boolean(isActive),
    updated_by: userId,
  });
  return serializeTemplate(row);
};

const remove = async (id) => {
  const row = await LeadStatusWhatsAppTemplate.findByPk(id);
  if (!row) throw new AppError('WhatsApp template not found', 404);
  await row.destroy();
  return true;
};

module.exports = {
  listAll,
  getById,
  getByTemplateName,
  getByLeadStatusId,
  getByLeadStatusName,
  create,
  update,
  remove,
  updateActiveStatus,
};
