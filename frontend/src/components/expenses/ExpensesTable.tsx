import type { Expense } from '../../types/expense';
import { formatMoney } from '../../lib/formatters';

type Props = {
  expenses: Expense[];
};

export default function ExpensesTable({ expenses }: Props) {
  if (expenses.length === 0) {
    return <div className="empty-state">Todavía no hay gastos guardados.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Comercio</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th>Original</th>
            <th>Colones</th>
            <th>Dólares</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.date ?? 'Sin fecha'}</td>
              <td>{expense.merchant ?? 'Sin comercio'}</td>
              <td>{expense.description}</td>
              <td>{expense.categoryName ?? 'Sin categoría'}</td>
              <td className="amount">
                {formatMoney(expense.amount, expense.currency || 'CRC')}
              </td>
              <td className="amount">
                {formatMoney(expense.amountCrc, 'CRC')}
              </td>
              <td className="amount">
                {formatMoney(expense.amountUsd, 'USD')}
              </td>
              <td>
                <span className={expense.needsReview ? 'badge warn' : 'badge ok'}>
                  {expense.needsReview ? 'Revisar' : 'OK'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
