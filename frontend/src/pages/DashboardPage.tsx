import type { Dashboard } from '../types/dashboard';
import BarList from '../components/charts/BarList';

type Props = {
  dashboard: Dashboard | null;
  loading: boolean;
};

export default function DashboardPage({ dashboard, loading }: Props) {
  if (loading) return <section className="panel">Cargando dashboard...</section>;
  if (!dashboard) return <section className="panel">Sin datos disponibles.</section>;

  const { summary } = dashboard;

  return (
    <div className="dashboard-grid">
      <section className="metric-row">
        <article>
          <span>Total</span>
          <strong>{summary.total.toLocaleString('es-CR', { style: 'currency', currency: 'EUR' })}</strong>
        </article>
        <article>
          <span>Gastos</span>
          <strong>{summary.count}</strong>
        </article>
        <article>
          <span>Promedio</span>
          <strong>{summary.average.toLocaleString('es-CR', { style: 'currency', currency: 'EUR' })}</strong>
        </article>
        <article>
          <span>Por revisar</span>
          <strong>{summary.needsReview}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>Por categoría</h2>
        </div>
        <BarList items={dashboard.byCategory.map((item) => ({ label: item.category, value: item.total }))} />
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>Por mes</h2>
        </div>
        <BarList items={dashboard.byMonth.map((item) => ({ label: item.month, value: item.total }))} />
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>Top comercios</h2>
        </div>
        <BarList items={dashboard.byMerchant.map((item) => ({ label: item.merchant, value: item.total }))} />
      </section>
    </div>
  );
}
