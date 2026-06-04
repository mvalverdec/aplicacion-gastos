'use strict';

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizeCurrency(currency) {
  return String(currency || 'CRC').trim().toUpperCase();
}

function getEurUsdRate() {
  const rate = Number(process.env.EUR_USD_RATE || 0);
  return rate > 0 ? rate : null;
}

function convertAmount(amount, currency, exchangeRate) {
  const numericAmount = Number(amount || 0);
  const normalizedCurrency = normalizeCurrency(currency);
  const usdSellRate = exchangeRate.rate;

  if (!usdSellRate) {
    return {
      amountOriginal: round2(numericAmount),
      currency: normalizedCurrency,
      amountCrc: null,
      amountUsd: null,
      conversionStatus: 'missing_usd_crc_rate',
    };
  }

  if (normalizedCurrency === 'CRC') {
    return {
      amountOriginal: round2(numericAmount),
      currency: normalizedCurrency,
      amountCrc: round2(numericAmount),
      amountUsd: round2(numericAmount / usdSellRate),
      conversionStatus: 'converted',
    };
  }

  if (normalizedCurrency === 'USD') {
    return {
      amountOriginal: round2(numericAmount),
      currency: normalizedCurrency,
      amountCrc: round2(numericAmount * usdSellRate),
      amountUsd: round2(numericAmount),
      conversionStatus: 'converted',
    };
  }

  if (normalizedCurrency === 'EUR') {
    const eurUsdRate = getEurUsdRate();
    if (!eurUsdRate) {
      return {
        amountOriginal: round2(numericAmount),
        currency: normalizedCurrency,
        amountCrc: null,
        amountUsd: null,
        conversionStatus: 'missing_eur_usd_rate',
      };
    }

    const amountUsd = numericAmount * eurUsdRate;
    return {
      amountOriginal: round2(numericAmount),
      currency: normalizedCurrency,
      amountCrc: round2(amountUsd * usdSellRate),
      amountUsd: round2(amountUsd),
      conversionStatus: 'converted',
    };
  }

  return {
    amountOriginal: round2(numericAmount),
    currency: normalizedCurrency,
    amountCrc: null,
    amountUsd: null,
    conversionStatus: 'unsupported_currency',
  };
}

function sumConverted(expenses, exchangeRate) {
  return expenses.reduce((totals, expense) => {
    const converted = convertAmount(expense.amount, expense.currency, exchangeRate);
    return {
      amountCrc: totals.amountCrc + (converted.amountCrc || 0),
      amountUsd: totals.amountUsd + (converted.amountUsd || 0),
    };
  }, { amountCrc: 0, amountUsd: 0 });
}

module.exports = { convertAmount, normalizeCurrency, round2, sumConverted };
