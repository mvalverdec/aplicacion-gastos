import { useEffect, useMemo, useState } from 'react';
import { getDashboard } from './services/api';
import type { Dashboard } from './types/dashboard';
import ImportPage from './pages/ImportPage';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import ReviewPage from './pages/ReviewPage';

type View = 'import' | 'dashboard' | 'expenses' | 'review';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      setDashboard(await getDashboard());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const navItems = useMemo<Array<{ id: View; label: string }>>(
    () => [
      { id: 'import', label: 'Importar' },
      { id: 'review', label: 'Revisión' },
      { id: 'expenses', label: 'Gastos' },
      { id: 'dashboard', label: 'Dashboard' },
    ],
    [],
  );

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>Gastos</h1>
          <p>Importación con Gemini, revisión y métricas locales.</p>
        </div>
        <nav className="tabs" aria-label="Vistas">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? 'active' : ''}
              type="button"
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {error && (
        <section className="notice error">
          <strong>No se pudo conectar.</strong>
          <span>{error}</span>
        </section>
      )}

      {view === 'dashboard' && <DashboardPage dashboard={dashboard} loading={loading} />}
      {view === 'review' && <ReviewPage onChanged={refresh} />}
      {view === 'expenses' && <ExpensesPage expenses={dashboard?.recentExpenses ?? []} loading={loading} />}
      {view === 'import' && <ImportPage onImported={refresh} />}
    </main>
  );
}
