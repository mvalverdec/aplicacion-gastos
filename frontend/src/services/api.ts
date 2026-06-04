import type { Dashboard } from '../types/dashboard';
import type { Category } from '../types/category';
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

export async function getExpenses(filters: { needsReview?: boolean } = {}): Promise<Expense[]> {
  const params = new URLSearchParams();
  if (filters.needsReview !== undefined) {
    params.set('needsReview', String(filters.needsReview));
  }
  const query = params.toString();
  const response = await fetch(`/api/expenses${query ? `?${query}` : ''}`);
  return parseResponse<Expense[]>(response);
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories');
  return parseResponse<Category[]>(response);
}

export async function importText(text: string) {
  const response = await fetch('/api/imports', {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, sourceName: 'texto-manual.txt' }),
  });
  return parseResponse<{ expenses: Expense[] }>(response);
}

export async function importFiles(files: File[]) {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }
  const response = await fetch('/api/imports', {
    method: 'POST',
    body: formData,
  });
  return parseResponse<{ expenses: Expense[] }>(response);
}

export async function updateExpense(id: number, expense: Partial<Expense>): Promise<Expense> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(expense),
  });
  return parseResponse<Expense>(response);
}
