const express = require('express');
const feedbackController = require('../controllers/feedback.controller');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/', authorize('feedback.view'), feedbackController.list);
router.get('/:id', authorize('feedback.view'), feedbackController.getById);
router.post('/', authorize('feedback.create'), feedbackController.create);
router.put('/:id', authorize('feedback.edit'), feedbackController.update);
router.delete('/:id', authorize('feedback.delete'), feedbackController.remove);

module.exports = router;
