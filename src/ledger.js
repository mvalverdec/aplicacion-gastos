'use strict';

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, '..', 'expenses.json');

function readLedger() {
  if (!fs.existsSync(LEDGER_PATH)) return [];
  return JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf-8'));
}

function writeLedger(expenses) {
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(expenses, null, 2), 'utf-8');
}

function appendBatch(expenses, batchId) {
  const ledger = readLedger();
  const appliedAt = new Date().toISOString();
  for (const expense of expenses) {
    ledger.push({ ...expense, batch_id: batchId, applied_at: appliedAt });
  }
  writeLedger(ledger);
}

function undoLastBatch() {
  const ledger = readLedger();
  if (ledger.length === 0) return null;
  const batchId = ledger[ledger.length - 1].batch_id;
  const filtered = ledger.filter(e => e.batch_id !== batchId);
  writeLedger(filtered);
  return { removed: ledger.length - filtered.length, batchId };
}

module.exports = { readLedger, appendBatch, undoLastBatch };
