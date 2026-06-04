'use strict';

const expensesRepository = require('../repositories/expenses.repository');
const currencyService = require('./currency.service');
const exchangeRateService = require('./exchange-rate.service');

function blankTotals() {
  return { amountCrc: 0, amountUsd: 0, count: 0 };
}

function addExpense(totals, expense) {
  totals.amountCrc += expense.amountCrc || 0;
  totals.amountUsd += expense.amountUsd || 0;
  totals.count += 1;
}

function sortByCrcDesc(a, b) {
  return b.amountCrc - a.amountCrc;
}

function toTotalsObject(totals) {
  return {
    amountCrc: currencyService.round2(totals.amountCrc),
    amountUsd: currencyService.round2(totals.amountUsd),
    count: totals.count,
  };
}

async function getConvertedExpenses(filters) {
  const exchangeRate = await exchangeRateService.getUsdSellRate();
  const expenses = await expensesRepository.listExpenses(filters, exchangeRate);
  return { exchangeRate, expenses };
}

async function summary(filters) {
  const { exchangeRate, expenses } = await getConvertedExpenses(filters);
  const totals = expenses.reduce((current, expense) => {
    addExpense(current, expense);
    return current;
  }, blankTotals());

  const convertedTotals = toTotalsObject(totals);
  return {
    ...convertedTotals,
    averageCrc: totals.count > 0 ? currencyService.round2(totals.amountCrc / totals.count) : 0,
    averageUsd: totals.count > 0 ? currencyService.round2(totals.amountUsd / totals.count) : 0,
    count: totals.count,
    needsReview: expenses.filter(expense => expense.needsReview).length,
    exchangeRate,
    conversionIssues: expenses
      .filter(expense => expense.conversionStatus !== 'converted')
      .map(expense => ({
        id: expense.id,
        currency: expense.currency,
        status: expense.conversionStatus,
      })),
  };
}

function groupExpenses(expenses, getKey) {
  const groups = new Map();

  for (const expense of expenses) {
    const key = getKey(expense);
    if (!groups.has(key)) groups.set(key, blankTotals());
    addExpense(groups.get(key), expense);
  }

  return Array.from(groups.entries())
    .map(([key, totals]) => ({ key, ...toTotalsObject(totals) }))
    .sort(sortByCrcDesc);
}

function groupOriginalCurrency(expenses) {
  const groups = new Map();

  for (const expense of expenses) {
    const key = expense.currency || 'CRC';
    if (!groups.has(key)) {
      groups.set(key, { amountOriginal: 0, ...blankTotals() });
    }
    const totals = groups.get(key);
    totals.amountOriginal += expense.amount || 0;
    addExpense(totals, expense);
  }

  return Array.from(groups.entries())
    .map(([currency, totals]) => ({
      currency,
      amountOriginal: currencyService.round2(totals.amountOriginal),
      ...toTotalsObject(totals),
    }))
    .sort(sortByCrcDesc);
}

async function byCategory(filters) {
  const { expenses } = await getConvertedExpenses(filters);
  return groupExpenses(expenses, expense => expense.categoryName || '(sin categoría)')
    .map(({ key, ...totals }) => ({ category: key, ...totals }));
}

async function byMonth(filters) {
  const { expenses } = await getConvertedExpenses(filters);
  return groupExpenses(expenses, expense => expense.date ? expense.date.slice(0, 7) : '(sin fecha)')
    .map(({ key, ...totals }) => ({ month: key, ...totals }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

async function byMerchant(filters) {
  const { expenses } = await getConvertedExpenses(filters);
  return groupExpenses(expenses, expense => expense.merchant || '(sin comercio)')
    .slice(0, 10)
    .map(({ key, ...totals }) => ({ merchant: key, ...totals }));
}

async function paymentMethods(filters) {
  const { expenses } = await getConvertedExpenses(filters);
  return groupExpenses(expenses, expense => expense.paymentMethod || '(sin método)')
    .map(({ key, ...totals }) => ({ method: key, ...totals }));
}

async function dashboard(filters) {
  const { exchangeRate, expenses } = await getConvertedExpenses(filters);
  const totals = expenses.reduce((current, expense) => {
    addExpense(current, expense);
    return current;
  }, blankTotals());

  const byCategoryData = groupExpenses(expenses, expense => expense.categoryName || '(sin categoría)')
    .map(({ key, ...groupTotals }) => ({ category: key, ...groupTotals }));
  const byMonthData = groupExpenses(expenses, expense => expense.date ? expense.date.slice(0, 7) : '(sin fecha)')
    .map(({ key, ...groupTotals }) => ({ month: key, ...groupTotals }))
    .sort((a, b) => a.month.localeCompare(b.month));
  const byMerchantData = groupExpenses(expenses, expense => expense.merchant || '(sin comercio)')
    .slice(0, 10)
    .map(({ key, ...groupTotals }) => ({ merchant: key, ...groupTotals }));
  const paymentMethodsData = groupExpenses(expenses, expense => expense.paymentMethod || '(sin método)')
    .map(({ key, ...groupTotals }) => ({ method: key, ...groupTotals }));
  const byCurrencyData = groupOriginalCurrency(expenses);

  return {
    summary: {
      ...toTotalsObject(totals),
      averageCrc: totals.count > 0 ? currencyService.round2(totals.amountCrc / totals.count) : 0,
      averageUsd: totals.count > 0 ? currencyService.round2(totals.amountUsd / totals.count) : 0,
      count: totals.count,
      needsReview: expenses.filter(expense => expense.needsReview).length,
      exchangeRate,
      conversionIssues: expenses
        .filter(expense => expense.conversionStatus !== 'converted')
        .map(expense => ({
          id: expense.id,
          currency: expense.currency,
          status: expense.conversionStatus,
        })),
    },
    byCategory: byCategoryData,
    byMonth: byMonthData,
    byMerchant: byMerchantData,
    paymentMethods: paymentMethodsData,
    byCurrency: byCurrencyData,
    recentExpenses: expenses,
  };
}

module.exports = { summary, byCategory, byMonth, byMerchant, paymentMethods, dashboard };
