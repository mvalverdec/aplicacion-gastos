'use strict';

const geminiService = require('./gemini.service');
const normalizer = require('./expense-normalizer.service');
const importsRepository = require('../repositories/imports.repository');
const expensesRepository = require('../repositories/expenses.repository');

async function processImport({ file, text, sourceName }) {
  if (!file && !text) {
    const error = new Error('Debe enviar un archivo o texto para procesar.');
    error.statusCode = 400;
    throw error;
  }

  const parsed = file
    ? await geminiService.parseUploadedFile(file)
    : await geminiService.parseText(text, sourceName);

  const importRecord = await importsRepository.createImport({
    sourceType: parsed.sourceType,
    sourceName: parsed.sourceName,
    status: 'processed',
    geminiModel: parsed.model,
    geminiRawResult: parsed.rawResult,
  });

  const dbExpenses = await normalizer.toDbExpenses(parsed.expenses, importRecord.id);
  const expenses = await expensesRepository.createMany(dbExpenses);

  return { import: importRecord, expenses };
}

module.exports = { processImport };
