const auditService = require('../services/audit.service');
const logger = require('../config/logger');

const auditMiddleware = (action, moduleName) => async (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (res.statusCode < 400 && req.user) {
      setImmediate(async () => {
        try {
          await auditService.create({
            user_id: req.user.id,
            action,
            module: moduleName,
            entity_id: req.params.id || (body?.data?.id ? String(body.data.id) : null),
            description: `${action} on ${moduleName}`,
            ip_address: req.ip,
            user_agent: req.get('user-agent'),
            request_method: req.method,
            request_url: req.originalUrl,
            metadata: {
              params: req.params,
              query: req.query,
            },
          });
        } catch (err) {
          logger.error('Audit log failed: %s', err.message);
        }
      });
    }
    return originalJson(body);
  };

  next();
};

module.exports = auditMiddleware;
