const reportService = require('../services/report.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const sales = asyncHandler(async (req, res) => {
  const data = await reportService.salesSummary(req.query);
  res.json(ApiResponse.success('Sales report retrieved', data));
});

const leadConversion = asyncHandler(async (req, res) => {
  const data = await reportService.leadConversion(req.query);
  res.json(ApiResponse.success('Lead conversion report retrieved', data));
});

const financial = asyncHandler(async (req, res) => {
  const data = await reportService.financialSummary(req.query);
  res.json(ApiResponse.success('Financial report retrieved', data));
});

const profitAndLoss = asyncHandler(async (req, res) => {
  const data = await reportService.profitAndLoss(req.query);
  res.json(ApiResponse.success('Profit and loss report retrieved', data));
});

const enquiries = asyncHandler(async (req, res) => {
  const result = await reportService.enquiryReport(req.query);
  res.json(ApiResponse.paginated('Enquiry report retrieved', result.data, result.pagination));
});

const expenses = asyncHandler(async (req, res) => {
  const result = await reportService.expenseReport(req.query);
  res.json(
    ApiResponse.paginated('Expense report retrieved', result.data, {
      ...result.pagination,
      summary: result.summary,
      from: result.from,
      to: result.to,
    })
  );
});

const customers = asyncHandler(async (req, res) => {
  const result = await reportService.customerReport(req.query);
  res.json(
    ApiResponse.paginated('Customer report retrieved', result.data, {
      ...result.pagination,
      summary: result.summary,
    })
  );
});

const vehicles = asyncHandler(async (req, res) => {
  const result = await reportService.vehicleReport(req.query);
  res.json(
    ApiResponse.paginated('Vehicle report retrieved', result.data, {
      ...result.pagination,
      summary: result.summary,
    })
  );
});

const drivers = asyncHandler(async (req, res) => {
  const result = await reportService.driverReport(req.query);
  res.json(
    ApiResponse.paginated('Driver report retrieved', result.data, {
      ...result.pagination,
      summary: result.summary,
    })
  );
});

const followUps = asyncHandler(async (req, res) => {
  const result = await reportService.userFollowUps(req.query);
  res.json(
    ApiResponse.paginated('User follow-up report retrieved', result.data, {
      ...result.pagination,
      summary: result.summary,
    })
  );
});

const attendance = asyncHandler(async (req, res) => {
  const result = await reportService.userAttendance(req.query);
  res.json(
    ApiResponse.paginated('User attendance report retrieved', result.data, {
      ...result.pagination,
      summary: {
        from: result.from,
        to: result.to,
        period: result.period,
        date_label: result.date_label,
      },
    })
  );
});

const mis = asyncHandler(async (req, res) => {
  const result = await reportService.misReport(req.query);
  res.json(
    ApiResponse.paginated('MIS report retrieved', result.data, {
      ...result.pagination,
      summary: result.summary,
      from: result.from,
      to: result.to,
    })
  );
});

const tours = asyncHandler(async (req, res) => {
  const result = await reportService.toursReport(req.query);
  res.json(
    ApiResponse.paginated('Tours report retrieved', result.data, {
      ...result.pagination,
      summary: result.summary,
      from: result.from,
      to: result.to,
    })
  );
});

module.exports = {
  sales,
  leadConversion,
  financial,
  profitAndLoss,
  enquiries,
  expenses,
  customers,
  vehicles,
  drivers,
  followUps,
  attendance,
  mis,
  tours,
};
