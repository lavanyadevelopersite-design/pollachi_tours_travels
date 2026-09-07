const express = require('express');
const roleController = require('../controllers/role.controller');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get(
  '/permissions',
  authorize('permissions.view', 'roles.view', 'roles.edit'),
  roleController.listPermissions
);
router.get('/', authorize('roles.view'), roleController.list);
router.get('/:id', authorize('roles.view'), roleController.getById);
router.post('/', authorize('roles.create'), roleController.create);
router.put('/:id', authorize('roles.edit'), roleController.update);
router.delete('/:id', authorize('roles.delete'), roleController.remove);

module.exports = router;
