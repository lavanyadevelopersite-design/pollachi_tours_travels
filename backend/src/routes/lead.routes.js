const express = require('express');
const leadController = require('../controllers/lead.controller');
const validate = require('../middleware/validate.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { createLeadSchema, updateLeadSchema } = require('../validators/lead.validator');

const router = express.Router();

router.get('/', authorize('leads.view'), leadController.list);
router.get('/:id', authorize('leads.view'), leadController.getById);
router.post('/', authorize('leads.create'), validate(createLeadSchema), leadController.create);
router.put('/:id', authorize('leads.edit'), validate(updateLeadSchema), leadController.update);
router.delete('/:id', authorize('leads.delete'), leadController.remove);

module.exports = router;
