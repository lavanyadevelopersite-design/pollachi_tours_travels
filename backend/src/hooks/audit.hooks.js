const auditService = require('../services/audit.service');
const logger = require('../config/logger');

/**
 * Attach Sequelize hooks to auto-write audit entries for model mutations.
 * Call registerAuditHooks(Model, moduleName) after models are loaded.
 */
const registerAuditHooks = (Model, moduleName) => {
  const writeAudit = async (instance, action, options = {}) => {
    try {
      await auditService.create({
        user_id: options.userId || instance.updated_by || instance.created_by || null,
        action,
        module: moduleName,
        entity_id: instance.id ? String(instance.id) : null,
        description: `${action} ${Model.name}`,
        metadata: {
          changes: instance.changed ? instance.changed() : null,
        },
      });
    } catch (err) {
      logger.error('Audit hook failed for %s: %s', Model.name, err.message);
    }
  };

  Model.addHook('afterCreate', (instance, options) => writeAudit(instance, 'create', options));
  Model.addHook('afterUpdate', (instance, options) => writeAudit(instance, 'update', options));
  Model.addHook('afterDestroy', (instance, options) => writeAudit(instance, 'delete', options));
};

module.exports = { registerAuditHooks };
