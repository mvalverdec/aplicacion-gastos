'use strict';

const db = require('../db/connection');
const currencyService = require('../services/currency.service');

function formatDate(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function mapExpense(row, exchangeRate = null) {
  if (!row) return null;
  const converted = exchangeRate
    ? currencyService.convertAmount(row.amount, row.currency, exchangeRate)
    : { amountCrc: null, amountUsd: null, conversionStatus: 'not_requested' };

  return {
    id: Number(row.id),
    importId: row.import_id ? Number(row.import_id) : null,
    categoryId: row.category_id ? Number(row.category_id) : null,
    categoryName: row.category_name || null,
    date: formatDate(row.expense_date),
    merchant: row.merchant,
    description: row.description,
    amount: Number(row.amount),
    currency: row.currency,
    amountCrc: converted.amountCrc,
    amountUsd: converted.amountUsd,
    conversionStatus: converted.conversionStatus,
    paymentMethod: row.payment_method,
    documentNumber: row.document_number,
    confidence: row.confidence === null ? null : Number(row.confidence),
    needsReview: row.needs_review,
    rawItem: row.raw_item,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function createExpense(expense) {
  const result = await db.query(`
    insert into expenses (
      import_id, category_id, expense_date, merchant, description, amount, currency,
      payment_method, document_number, confidence, needs_review, raw_item, notes
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13)
    returning *
  `, [
    expense.importId || null,
    expense.categoryId || null,
    expense.date || null,
    expense.merchant || null,
    expense.description || '',
    expense.amount || 0,
    expense.currency || 'EUR',
    expense.paymentMethod || null,
    expense.documentNumber || null,
    expense.confidence || null,
    expense.needsReview || false,
    JSON.stringify(expense.rawItem || null),
    expense.notes || null,
  ]);
  return mapExpense(result.rows[0]);
}

async function createMany(expenses) {
  const created = [];
  for (const expense of expenses) {
    created.push(await createExpense(expense));
  }
  return created;
}

async function listExpenses(filters = {}, exchangeRate = null) {
  const where = [];
  const params = [];

  if (filters.from) {
    params.push(filters.from);
    where.push(`e.expense_date >= $${params.length}`);
  }
  if (filters.to) {
    params.push(filters.to);
    where.push(`e.expense_date <= $${params.length}`);
  }
  if (filters.categoryId) {
    params.push(filters.categoryId);
    where.push(`e.category_id = $${params.length}`);
  }
  if (filters.merchant) {
    params.push(`%${filters.merchant}%`);
    where.push(`e.merchant ilike $${params.length}`);
  }
  if (filters.needsReview !== undefined) {
    params.push(filters.needsReview === 'true' || filters.needsReview === true);
    where.push(`e.needs_review = $${params.length}`);
  }

  const result = await db.query(`
    select e.*, c.name as category_name
    from expenses e
    left join categories c on c.id = e.category_id
    ${where.length ? `where ${where.join(' and ')}` : ''}
    order by e.expense_date desc nulls last, e.created_at desc
    limit 500
  `, params);

  return result.rows.map(row => mapExpense(row, exchangeRate));
}

async function getExpense(id, exchangeRate = null) {
  const result = await db.query(`
    select e.*, c.name as category_name
    from expenses e
    left join categories c on c.id = e.category_id
    where e.id = $1
  `, [id]);
  return mapExpense(result.rows[0], exchangeRate);
}

async function updateExpense(id, expense) {
  const fields = {
    categoryId: 'category_id',
    date: 'expense_date',
    merchant: 'merchant',
    description: 'description',
    amount: 'amount',
    currency: 'currency',
    paymentMethod: 'payment_method',
    documentNumber: 'document_number',
    confidence: 'confidence',
    needsReview: 'needs_review',
    notes: 'notes',
  };

  const assignments = [];
  const params = [id];

  for (const [key, column] of Object.entries(fields)) {
    if (Object.prototype.hasOwnProperty.call(expense, key)) {
      params.push(expense[key]);
      assignments.push(`${column} = $${params.length}`);
    }
  }

  if (assignments.length === 0) {
    return getExpense(id);
  }

  const result = await db.query(`
    update expenses
    set ${assignments.join(', ')},
        updated_at = now()
    where id = $1
    returning id
  `, params);

  if (result.rowCount === 0) return null;
  return getExpense(id);
}

async function deleteExpense(id) {
  const result = await db.query('delete from expenses where id = $1 returning id', [id]);
  return result.rowCount > 0;
}

module.exports = { createExpense, createMany, listExpenses, getExpense, updateExpense, deleteExpense };
