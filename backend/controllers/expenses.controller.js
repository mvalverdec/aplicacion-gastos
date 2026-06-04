'use strict';

const expensesRepository = require('../repositories/expenses.repository');

async function listExpenses(req, res, next) {
  try {
    res.json(await expensesRepository.listExpenses(req.query));
  } catch (err) {
    next(err);
  }
}

async function getExpense(req, res, next) {
  try {
    const expense = await expensesRepository.getExpense(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Gasto no encontrado.' });
    return res.json(expense);
  } catch (err) {
    return next(err);
  }
}

async function createExpense(req, res, next) {
  try {
    res.status(201).json(await expensesRepository.createExpense(req.body));
  } catch (err) {
    next(err);
  }
}

async function updateExpense(req, res, next) {
  try {
    const expense = await expensesRepository.updateExpense(req.params.id, req.body);
    if (!expense) return res.status(404).json({ error: 'Gasto no encontrado.' });
    return res.json(expense);
  } catch (err) {
    return next(err);
  }
}

async function deleteExpense(req, res, next) {
  try {
    const deleted = await expensesRepository.deleteExpense(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Gasto no encontrado.' });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { listExpenses, getExpense, createExpense, updateExpense, deleteExpense };
