const express = require('express');
const followUpController = require('../controllers/followUp.controller');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/', authorize('follow_ups.view'), followUpController.list);
router.get('/:id', authorize('follow_ups.view'), followUpController.getById);
router.post('/', authorize('follow_ups.create'), followUpController.create);
router.put('/:id', authorize('follow_ups.edit'), followUpController.update);
router.delete('/:id', authorize('follow_ups.delete'), followUpController.remove);

module.exports = router;
