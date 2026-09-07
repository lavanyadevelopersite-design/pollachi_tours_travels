const express = require('express');
const expenseController = require('../controllers/expense.controller');
const { authorize } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/', authorize('expenses.view'), expenseController.list);
router.get('/categories', authorize('expenses.view'), expenseController.categories);
router.get('/:id', authorize('expenses.view'), expenseController.getById);
router.post('/', authorize('expenses.create'), expenseController.create);
router.put('/:id', authorize('expenses.edit'), expenseController.update);
router.delete('/:id', authorize('expenses.delete'), expenseController.remove);

module.exports = router;
