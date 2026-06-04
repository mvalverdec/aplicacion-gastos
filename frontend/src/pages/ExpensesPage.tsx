import type { Expense } from '../types/expense';
import ExpensesTable from '../components/expenses/ExpensesTable';

type Props = {
  expenses: Expense[];
  loading: boolean;
};

export default function ExpensesPage({ expenses, loading }: Props) {
  return (
    <section className="panel">
      <div className="section-title">
        <h2>Tabla de gastos</h2>
        <p>{loading ? 'Cargando...' : `${expenses.length} gasto(s) recientes`}</p>
      </div>
      <ExpensesTable expenses={expenses} />
    </section>
  );
}
