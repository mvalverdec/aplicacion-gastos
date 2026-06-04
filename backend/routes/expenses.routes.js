'use strict';

const express = require('express');
const controller = require('../controllers/expenses.controller');

const router = express.Router();

router.get('/expenses', controller.listExpenses);
router.get('/expenses/:id', controller.getExpense);
router.post('/expenses', controller.createExpense);
router.patch('/expenses/:id', controller.updateExpense);
router.delete('/expenses/:id', controller.deleteExpense);

module.exports = router;
