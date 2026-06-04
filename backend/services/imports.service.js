'use strict';

const geminiService = require('./gemini.service');
const normalizer = require('./expense-normalizer.service');
const importsRepository = require('../repositories/imports.repository');
const expensesRepository = require('../repositories/expenses.repository');

async function saveParsedImport(parsed) {
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

async function processImport({ files = [], text, sourceName }) {
  if (files.length === 0 && !text) {
    const error = new Error('Debe enviar un archivo o texto para procesar.');
    error.statusCode = 400;
    throw error;
  }

  const results = [];

  for (const file of files) {
    const parsed = await geminiService.parseUploadedFile(file);
    results.push(await saveParsedImport(parsed));
  }

  if (text) {
    const parsed = await geminiService.parseText(text, sourceName);
    results.push(await saveParsedImport(parsed));
  }

  return {
    imports: results.map(result => result.import),
    expenses: results.flatMap(result => result.expenses),
  };
}

module.exports = { processImport };
