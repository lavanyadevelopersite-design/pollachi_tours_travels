const express = require('express');
const whatsappTemplateController = require('../controllers/whatsappTemplate.controller');
const validate = require('../middleware/validate.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const {
  createTemplateSchema,
  updateTemplateSchema,
  templateIdSchema,
  updateTemplateStatusSchema,
} = require('../validators/whatsappTemplate.validator');

const router = express.Router();

router.get('/', authorize('lead_statuses.view'), whatsappTemplateController.list);
router.get('/:id', authorize('lead_statuses.view'), validate(templateIdSchema), whatsappTemplateController.getById);
router.post('/', authorize('lead_statuses.edit'), validate(createTemplateSchema), whatsappTemplateController.create);
router.put(
  '/:id',
  authorize('lead_statuses.edit'),
  validate(updateTemplateSchema),
  whatsappTemplateController.update
);
router.patch(
  '/:id/status',
  authorize('lead_statuses.edit'),
  validate(updateTemplateStatusSchema),
  whatsappTemplateController.updateStatus
);
router.delete(
  '/:id',
  authorize('lead_statuses.edit'),
  validate(templateIdSchema),
  whatsappTemplateController.remove
);

module.exports = router;
