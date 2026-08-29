const followUpService = require('../services/followUp.service');
const createCrudController = require('./crud.factory');

module.exports = createCrudController(followUpService, 'FollowUp');
