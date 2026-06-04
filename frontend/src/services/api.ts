import type { Dashboard } from '../types/dashboard';
import type { Expense } from '../types/expense';

const headers = { 'Content-Type': 'application/json' };

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || 'La solicitud falló.');
  }
  return body as T;
}

export async function getDashboard(): Promise<Dashboard> {
  const response = await fetch('/api/dashboard');
  return parseResponse<Dashboard>(response);
}

export async function getExpenses(): Promise<Expense[]> {
  const response = await fetch('/api/expenses');
  return parseResponse<Expense[]>(response);
}

export async function importText(text: string) {
  const response = await fetch('/api/imports', {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, sourceName: 'texto-manual.txt' }),
  });
  return parseResponse<{ expenses: Expense[] }>(response);
}

export async function importFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/imports', {
    method: 'POST',
    body: formData,
  });
  return parseResponse<{ expenses: Expense[] }>(response);
}
