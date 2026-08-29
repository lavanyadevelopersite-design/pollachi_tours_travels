const express = require('express');
const loginHistoryController = require('../controllers/loginHistory.controller');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/summary', authorize('login_history.view'), loginHistoryController.summary);
router.get('/user-report', authorize('login_history.view'), loginHistoryController.userReport);
router.get('/', authorize('login_history.view'), loginHistoryController.list);

module.exports = router;
