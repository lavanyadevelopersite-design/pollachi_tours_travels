const expenseService = require('../services/expense.service');
const createCrudController = require('./crud.factory');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
  ...createCrudController(expenseService, 'Expense'),
  categories: asyncHandler(async (req, res) => {
    const rows = await expenseService.listCategories();
    res.json(ApiResponse.success('Expense categories retrieved', rows));
  }),
};
