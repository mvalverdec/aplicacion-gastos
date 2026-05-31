'use strict';

const CATEGORIES = ['alimentación', 'transporte', 'alojamiento', 'material', 'servicios', 'otros'];

function formatReport(expenses) {
  if (expenses.length === 0) return 'No expenses recorded yet.';

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const needsReview = expenses.filter(e => e.status === 'needs_review').length;

  const byCategory = {};
  for (const expense of expenses) {
    const key = expense.category ?? '(sin categoría)';
    if (!byCategory[key]) byCategory[key] = { total: 0, count: 0 };
    byCategory[key].total += expense.amount;
    byCategory[key].count += 1;
  }

  const categoryOrder = [...CATEGORIES, '(sin categoría)'];
  const categoryLines = categoryOrder
    .filter(cat => byCategory[cat])
    .map(cat => {
      const { total: catTotal, count } = byCategory[cat];
      return `  ${cat.padEnd(16)} EUR ${catTotal.toFixed(2).padStart(10)}   (${count} expense${count !== 1 ? 's' : ''})`;
    });

  return [
    '=== Expense Report ===',
    `Total expenses:   ${expenses.length}`,
    `Total amount:     EUR ${total.toFixed(2)}`,
    '',
    'By category:',
    ...categoryLines,
    '',
    `Needs review:     ${needsReview}`,
  ].join('\n');
}

module.exports = { formatReport };
