'use strict';

const db = require('../db/connection');
const expensesRepository = require('../repositories/expenses.repository');

function filtersToWhere(filters = {}) {
  const where = [];
  const params = [];

  if (filters.from) {
    params.push(filters.from);
    where.push(`expense_date >= $${params.length}`);
  }
  if (filters.to) {
    params.push(filters.to);
    where.push(`expense_date <= $${params.length}`);
  }

  return {
    clause: where.length ? `where ${where.join(' and ')}` : '',
    params,
  };
}

async function summary(filters) {
  const { clause, params } = filtersToWhere(filters);
  const result = await db.query(`
    select
      coalesce(sum(amount), 0)::numeric(14, 2) as total,
      count(*)::int as count,
      coalesce(avg(amount), 0)::numeric(14, 2) as average,
      count(*) filter (where needs_review)::int as "needsReview"
    from expenses
    ${clause}
  `, params);
  const row = result.rows[0];
  return {
    total: Number(row.total),
    count: row.count,
    average: Number(row.average),
    needsReview: row.needsReview,
  };
}

async function byCategory(filters) {
  const { clause, params } = filtersToWhere(filters);
  const result = await db.query(`
    select coalesce(c.name, '(sin categoría)') as category,
           coalesce(sum(e.amount), 0)::numeric(14, 2) as total,
           count(*)::int as count
    from expenses e
    left join categories c on c.id = e.category_id
    ${clause.replaceAll('expense_date', 'e.expense_date')}
    group by coalesce(c.name, '(sin categoría)')
    order by total desc
  `, params);
  return result.rows.map(row => ({ ...row, total: Number(row.total) }));
}

async function byMonth(filters) {
  const { clause, params } = filtersToWhere(filters);
  const result = await db.query(`
    select to_char(date_trunc('month', expense_date), 'YYYY-MM') as month,
           coalesce(sum(amount), 0)::numeric(14, 2) as total,
           count(*)::int as count
    from expenses
    ${clause}
    group by date_trunc('month', expense_date)
    order by month asc
  `, params);
  return result.rows.map(row => ({ ...row, total: Number(row.total) }));
}

async function byMerchant(filters) {
  const { clause, params } = filtersToWhere(filters);
  const result = await db.query(`
    select coalesce(merchant, '(sin comercio)') as merchant,
           coalesce(sum(amount), 0)::numeric(14, 2) as total,
           count(*)::int as count
    from expenses
    ${clause}
    group by coalesce(merchant, '(sin comercio)')
    order by total desc
    limit 10
  `, params);
  return result.rows.map(row => ({ ...row, total: Number(row.total) }));
}

async function paymentMethods(filters) {
  const { clause, params } = filtersToWhere(filters);
  const result = await db.query(`
    select coalesce(payment_method, '(sin método)') as method,
           coalesce(sum(amount), 0)::numeric(14, 2) as total,
           count(*)::int as count
    from expenses
    ${clause}
    group by coalesce(payment_method, '(sin método)')
    order by total desc
  `, params);
  return result.rows.map(row => ({ ...row, total: Number(row.total) }));
}

async function dashboard(filters) {
  return {
    summary: await summary(filters),
    byCategory: await byCategory(filters),
    byMonth: await byMonth(filters),
    byMerchant: await byMerchant(filters),
    paymentMethods: await paymentMethods(filters),
    recentExpenses: await expensesRepository.listExpenses(filters),
  };
}

module.exports = { summary, byCategory, byMonth, byMerchant, paymentMethods, dashboard };
