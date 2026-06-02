'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { parseExpenses } = require('./src/parse');
const { readLedger, appendBatch, undoLastBatch, getAppliedFiles } = require('./src/ledger');
const { formatReport } = require('./src/report');

const SUPPORTED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.txt']);

const [,, command, inputPath] = process.argv;

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function applyFile(filePath) {
  const fileName = path.basename(filePath);

  if (getAppliedFiles().has(fileName)) {
    console.log(`  ⚠ "${fileName}" ya está en el ledger, omitido.`);
    return;
  }

  console.log(`\n→ ${fileName}`);
  const expenses = await parseExpenses(filePath);
  const batchId = crypto.randomUUID();

  const okExpenses = expenses.filter(e => e.status === 'ok' && e.date !== null);
  const reviewExpenses = expenses.filter(e => e.status === 'needs_review' || e.date === null);

  if (okExpenses.length > 0) {
    appendBatch(okExpenses, batchId);
    for (const e of okExpenses) {
      console.log(`  ✓ [${e.date}] ${e.currency} ${e.amount.toFixed(2)}  ${e.description}`);
    }
  }

  let saved = okExpenses.length;
  let discarded = 0;

  if (reviewExpenses.length > 0) {
    const today = new Date().toISOString().slice(0, 10);
    console.log(`\n  --- ${reviewExpenses.length} gasto(s) pendientes de revisión ---`);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const confirmed = [];

    for (let i = 0; i < reviewExpenses.length; i++) {
      const e = reviewExpenses[i];
      console.log(`\n  [${i + 1}/${reviewExpenses.length}] "${e.description}" ${e.currency} ${e.amount.toFixed(2)}  — ${e.warnings.join(', ')}`);
      const answer = (await ask(rl, `  Asignar fecha de hoy (${today})? [y/fecha/n]: `)).trim();

      if (answer === 'n') {
        discarded++;
        continue;
      }

      const date = (answer === 'y' || answer === '') ? today : answer;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        console.log('  Fecha inválida, descartado.');
        discarded++;
        continue;
      }

      confirmed.push({ ...e, date, status: 'ok', warnings: [] });
      console.log(`  ✓ guardado con fecha ${date}`);
    }

    rl.close();

    if (confirmed.length > 0) {
      appendBatch(confirmed, batchId);
      saved += confirmed.length;
    }
  }

  console.log(`  Applied ${saved} expense(s) — batch ${batchId}. ${discarded} descartado(s).`);
}

(async () => {
  switch (command) {
    case 'preview': {
      if (!inputPath) {
        console.error('Usage: node cli.js preview <file>');
        process.exit(1);
      }
      const expenses = await parseExpenses(inputPath);
      console.log(JSON.stringify(expenses, null, 2));
      console.log(`\n--- ${expenses.length} expense(s) parsed. NOT written to ledger. ---`);
      break;
    }

    case 'apply': {
      if (!inputPath) {
        console.error('Usage: node cli.js apply <file>');
        process.exit(1);
      }
      await applyFile(inputPath);
      break;
    }

    case 'apply-all': {
      const dir = inputPath || '.';
      const files = fs.readdirSync(dir)
        .filter(f => SUPPORTED_EXTENSIONS.has(path.extname(f).toLowerCase()))
        .map(f => path.join(dir, f));

      if (files.length === 0) {
        console.log('No se encontraron archivos soportados en el directorio.');
        break;
      }

      const applied = getAppliedFiles();
      const pending = files.filter(f => !applied.has(path.basename(f)));
      const skipped = files.length - pending.length;

      if (pending.length === 0) {
        console.log(`Todos los archivos ya están en el ledger (${skipped} omitido(s)).`);
        break;
      }

      console.log(`Procesando ${pending.length} archivo(s)${skipped > 0 ? `, ${skipped} ya importado(s) omitido(s)` : ''}...`);
      for (const file of pending) {
        await applyFile(file);
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
      console.error('Usage: node cli.js <preview|apply|apply-all|report|undo> [file|dir]');
      process.exit(1);
  }
})().catch(err => {
  console.error(err.message);
  process.exit(1);
});
