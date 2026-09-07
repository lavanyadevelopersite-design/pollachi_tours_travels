const express = require('express');
const controller = require('../controllers/userTablePreference.controller');

const router = express.Router();

router.get('/', controller.list);
router.get('/:tableKey', controller.getOne);
router.put('/:tableKey', controller.upsert);

module.exports = router;
