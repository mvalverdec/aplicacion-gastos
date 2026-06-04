import { useEffect, useMemo, useState } from 'react';
import { getCategories, getExpenses, updateExpense } from '../services/api';
import type { Category } from '../types/category';
import type { Expense } from '../types/expense';

type Props = {
  onChanged: () => Promise<void>;
};

type DraftExpense = {
  categoryId: string;
  date: string;
  merchant: string;
  description: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  notes: string;
};

function toDraft(expense: Expense): DraftExpense {
  return {
    categoryId: expense.categoryId ? String(expense.categoryId) : '',
    date: expense.date ?? '',
    merchant: expense.merchant ?? '',
    description: expense.description,
    amount: String(expense.amount),
    currency: expense.currency,
    paymentMethod: expense.paymentMethod ?? '',
    notes: expense.notes ?? '',
  };
}

function toPayload(draft: DraftExpense, needsReview: boolean) {
  return {
    categoryId: draft.categoryId ? Number(draft.categoryId) : null,
    date: draft.date || null,
    merchant: draft.merchant || null,
    description: draft.description,
    amount: Number(draft.amount || 0),
    currency: draft.currency || 'EUR',
    paymentMethod: draft.paymentMethod || null,
    notes: draft.notes || null,
    needsReview,
  };
}

export default function ReviewPage({ onChanged }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [drafts, setDrafts] = useState<Record<number, DraftExpense>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setMessage(null);
    try {
      const [pendingExpenses, categoryOptions] = await Promise.all([
        getExpenses({ needsReview: true }),
        getCategories(),
      ]);
      setExpenses(pendingExpenses);
      setCategories(categoryOptions);
      setDrafts(Object.fromEntries(pendingExpenses.map((expense) => [expense.id, toDraft(expense)])));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'No se pudo cargar la revisión.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const pendingCount = useMemo(() => expenses.length, [expenses]);

  function updateDraft(id: number, field: keyof DraftExpense, value: string) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  }

  async function saveExpense(expense: Expense, needsReview: boolean) {
    const draft = drafts[expense.id];
    if (!draft) return;

    setSavingId(expense.id);
    setMessage(null);
    try {
      await updateExpense(expense.id, toPayload(draft, needsReview));
      await load();
      await onChanged();
      setMessage(needsReview ? 'Gasto guardado.' : 'Gasto marcado como revisado.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'No se pudo guardar el gasto.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="panel">
      <div className="section-title split-title">
        <div>
          <h2>Revisión de gastos</h2>
          <p>{loading ? 'Cargando...' : `${pendingCount} gasto(s) pendientes`}</p>
        </div>
        <button type="button" className="secondary-button" onClick={load} disabled={loading}>
          Actualizar
        </button>
      </div>

      {message && <div className="inline-message">{message}</div>}

      {!loading && expenses.length === 0 && (
        <div className="empty-state">No hay gastos pendientes de revisión.</div>
      )}

      <div className="review-list">
        {expenses.map((expense) => {
          const draft = drafts[expense.id];
          if (!draft) return null;

          return (
            <article className="review-item" key={expense.id}>
              <div className="review-header">
                <div>
                  <strong>{expense.description}</strong>
                  <span>{expense.notes || 'Pendiente de confirmación'}</span>
                </div>
                <span className="badge warn">Revisar</span>
              </div>

              <div className="review-form">
                <label>
                  Fecha
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(event) => updateDraft(expense.id, 'date', event.target.value)}
                  />
                </label>

                <label>
                  Comercio
                  <input
                    value={draft.merchant}
                    onChange={(event) => updateDraft(expense.id, 'merchant', event.target.value)}
                  />
                </label>

                <label className="wide-field">
                  Descripción
                  <input
                    value={draft.description}
                    onChange={(event) => updateDraft(expense.id, 'description', event.target.value)}
                  />
                </label>

                <label>
                  Monto
                  <input
                    type="number"
                    step="0.01"
                    value={draft.amount}
                    onChange={(event) => updateDraft(expense.id, 'amount', event.target.value)}
                  />
                </label>

                <label>
                  Moneda
                  <input
                    value={draft.currency}
                    maxLength={3}
                    onChange={(event) => updateDraft(expense.id, 'currency', event.target.value.toUpperCase())}
                  />
                </label>

                <label>
                  Categoría
                  <select
                    value={draft.categoryId}
                    onChange={(event) => updateDraft(expense.id, 'categoryId', event.target.value)}
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Método
                  <input
                    value={draft.paymentMethod}
                    onChange={(event) => updateDraft(expense.id, 'paymentMethod', event.target.value)}
                  />
                </label>

                <label className="wide-field">
                  Notas
                  <input
                    value={draft.notes}
                    onChange={(event) => updateDraft(expense.id, 'notes', event.target.value)}
                  />
                </label>
              </div>

              <div className="review-actions">
                <button type="button" className="secondary-button" onClick={() => saveExpense(expense, true)} disabled={savingId === expense.id}>
                  Guardar
                </button>
                <button type="button" onClick={() => saveExpense(expense, false)} disabled={savingId === expense.id}>
                  Marcar revisado
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
