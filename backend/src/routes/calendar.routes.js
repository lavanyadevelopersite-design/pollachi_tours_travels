const express = require('express');
const calendarController = require('../controllers/calendar.controller');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/events', authorize('calendar.view'), calendarController.events);

module.exports = router;
