'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODEL = 'gemini-2.5-flash';

const MIME_MAP = {
  '.txt':  null,
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.pdf':  'application/pdf',
};

function sourceType(mimeType) {
  if (mimeType === null) return 'text';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'image';
}

function buildPrompt() {
  const today = new Date().toISOString().slice(0, 10);
  return `You are an expense extraction engine. Extract ALL expense line items from the provided document.

Return a JSON array of objects. Each object MUST have exactly these fields:
  date        – string "YYYY-MM-DD". If ambiguous or missing, use today ${today} and add "fecha ambigua" to warnings.
  amount      – number (float). Normalize European decimals: "1.234,56" → 1234.56, "12,50" → 12.50. If unreadable, use 0 and add "importe ilegible" to warnings.
  currency    – ISO-4217 string. Default "EUR" if not stated.
  description – string. If vague or multiple interpretations, add "descripción ambigua" to warnings.
  category    – one of: "alimentación","transporte","alojamiento","material","servicios","otros". Null if undeterminable; add "sin categoría" to warnings.
  status      – "needs_review" if warnings is non-empty, otherwise "ok".
  warnings    – string[]. Empty array [] if no issues.

Rules:
- Skip empty lines, totals rows, tax subtotals, and header rows.
- One object per line item. Multi-item documents return multiple objects.
- Do NOT include extra fields.
- Respond with ONLY the raw JSON array, no markdown fences, no explanation.`;
}

async function parseExpenses(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!(ext in MIME_MAP)) {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  const mimeType = MIME_MAP[ext];
  const prompt = buildPrompt();
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL });

  let parts;
  if (mimeType === null) {
    const text = fs.readFileSync(filePath, 'utf-8');
    parts = [prompt, text];
  } else {
    const data = fs.readFileSync(filePath).toString('base64');
    parts = [prompt, { inlineData: { mimeType, data } }];
  }

  const result = await model.generateContent(parts);
  const responseText = result.response.text().trim();

  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error(`Gemini returned invalid JSON:\n${responseText}`);
  }

  const fileName = path.basename(filePath);
  const type = sourceType(mimeType);

  return parsed.map(expense => ({
    ...expense,
    id: crypto.randomUUID(),
    source: { type, file: fileName },
  }));
}

module.exports = { parseExpenses };
