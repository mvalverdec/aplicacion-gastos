'use strict';

const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { parseExpenses } = require('../../src/parse');

const MODEL = 'gemini-2.5-flash';

function sourceTypeFromExtension(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.txt') return 'text';
  if (ext === '.pdf') return 'pdf';
  return 'image';
}

async function parseUploadedFile(file) {
  const ext = path.extname(file.originalname).toLowerCase() || '.txt';
  const parsePath = `${file.path}${ext}`;
  await fs.rename(file.path, parsePath);

  try {
    const expenses = await parseExpenses(parsePath);
    return {
      expenses,
      sourceType: sourceTypeFromExtension(parsePath),
      sourceName: file.originalname,
      model: MODEL,
      rawResult: expenses,
    };
  } finally {
    await fs.rm(parsePath, { force: true });
  }
}

async function parseText(text, sourceName = 'texto-manual.txt') {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'aplicacion-gastos-'));
  const filePath = path.join(dir, sourceName.endsWith('.txt') ? sourceName : `${sourceName}.txt`);

  try {
    await fs.writeFile(filePath, text, 'utf-8');
    const expenses = await parseExpenses(filePath);
    return {
      expenses,
      sourceType: 'text',
      sourceName: path.basename(filePath),
      model: MODEL,
      rawResult: expenses,
    };
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

module.exports = { parseUploadedFile, parseText };
