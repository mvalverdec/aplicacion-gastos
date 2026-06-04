'use strict';

const categoriesRepository = require('../repositories/categories.repository');

async function toDbExpense(expense, importId) {
  const category = await categoriesRepository.findByName(expense.category);

  return {
    importId,
    categoryId: category ? category.id : null,
    date: expense.date || null,
    merchant: expense.merchant || null,
    description: expense.description || 'Sin descripción',
    amount: Number(expense.amount || 0),
    currency: expense.currency || 'EUR',
    paymentMethod: expense.paymentMethod || expense.payment_method || null,
    documentNumber: expense.documentNumber || expense.document_number || null,
    confidence: expense.confidence || null,
    needsReview: expense.status === 'needs_review' || Boolean(expense.needsReview) || !expense.date,
    rawItem: expense,
    notes: Array.isArray(expense.warnings) && expense.warnings.length > 0 ? expense.warnings.join(', ') : null,
  };
}

async function toDbExpenses(expenses, importId) {
  const normalized = [];
  for (const expense of expenses) {
    normalized.push(await toDbExpense(expense, importId));
  }
  return normalized;
}

module.exports = { toDbExpense, toDbExpenses };
