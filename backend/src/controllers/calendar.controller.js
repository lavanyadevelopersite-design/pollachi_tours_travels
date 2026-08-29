const calendarService = require('../services/calendar.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const events = asyncHandler(async (req, res) => {
  const data = await calendarService.getEvents(req.query);
  res.json(ApiResponse.success('Calendar events retrieved', data));
});

module.exports = { events };
