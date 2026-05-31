'use strict';

require('dotenv').config();
const { parseExpenses } = require('./src/parse');
const { readLedger, appendBatch, undoLastBatch } = require('./src/ledger');
const { formatReport } = require('./src/report');

const [,, command, filePath] = process.argv;

(async () => {
  switch (command) {
    case 'preview': {
      if (!filePath) {
        console.error('Usage: node cli.js preview <file>');
        process.exit(1);
      }
      const expenses = await parseExpenses(filePath);
      console.log(JSON.stringify(expenses, null, 2));
      console.log(`\n--- ${expenses.length} expense(s) parsed. NOT written to ledger. ---`);
      break;
    }

    case 'apply': {
      if (!filePath) {
        console.error('Usage: node cli.js apply <file>');
        process.exit(1);
      }
      const expenses = await parseExpenses(filePath);
      const batchId = crypto.randomUUID();
      appendBatch(expenses, batchId);
      console.log(`Applied ${expenses.length} expense(s) — batch ${batchId}`);
      for (const e of expenses) {
        console.log(`  + [${e.date}] ${e.currency} ${e.amount.toFixed(2)} ${e.description} (${e.status})`);
      }
      break;
    }

    case 'report': {
      const expenses = readLedger();
      console.log(formatReport(expenses));
      break;
    }

    case 'undo': {
      const result = undoLastBatch();
      if (!result) {
        console.log('Ledger is empty. Nothing to undo.');
      } else {
        console.log(`Removed ${result.removed} expense(s) from batch ${result.batchId}.`);
      }
      break;
    }

    default:
      console.error('Usage: node cli.js <preview|apply|report|undo> [file]');
      process.exit(1);
  }
})().catch(err => {
  console.error(err.message);
  process.exit(1);
});
