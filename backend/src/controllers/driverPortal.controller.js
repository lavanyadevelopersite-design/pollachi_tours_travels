const driverPortalService = require('../services/driverPortal.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const result = await driverPortalService.login(req.body, {
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: req.body.rememberMe === false ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000,
  });
  res.json(
    ApiResponse.success('Driver login successful', {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })
  );
});

const me = asyncHandler(async (req, res) => {
  const user = await driverPortalService.me(req.user.id);
  res.json(ApiResponse.success('Driver profile retrieved', user));
});

const listTrips = asyncHandler(async (req, res) => {
  const data = await driverPortalService.listMyTrips(req.user, {
    enquiry: req.query.enquiry || null,
  });
  res.json(ApiResponse.success('Trips retrieved', data));
});

const getTrip = asyncHandler(async (req, res) => {
  const data = await driverPortalService.getMyTrip(req.user, req.params.id);
  res.json(ApiResponse.success('Trip retrieved', data));
});

const getTripByEnquiry = asyncHandler(async (req, res) => {
  const data = await driverPortalService.getMyTripByEnquiry(
    req.user,
    req.params.enquiryKey
  );
  res.json(ApiResponse.success('Trip retrieved', data));
});

const updateTrip = asyncHandler(async (req, res) => {
  const data = await driverPortalService.updateMyTrip(
    req.user,
    req.params.id,
    req.body,
    req.files || {}
  );
  res.json(ApiResponse.success('Trip updated', data));
});

const statusOptions = asyncHandler(async (req, res) => {
  res.json(
    ApiResponse.success('Status options', {
      status_options: driverPortalService.getStatusOptions(),
    })
  );
});

module.exports = {
  login,
  me,
  listTrips,
  getTrip,
  getTripByEnquiry,
  updateTrip,
  statusOptions,
};
