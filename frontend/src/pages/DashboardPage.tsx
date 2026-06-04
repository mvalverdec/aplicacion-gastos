import type { Dashboard } from '../types/dashboard';
import BarList from '../components/charts/BarList';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import CurrencyBreakdown from '../components/charts/CurrencyBreakdown';
import MonthlyBarChart from '../components/charts/MonthlyBarChart';
import ExpensesTable from '../components/expenses/ExpensesTable';
import { formatMoney } from '../lib/formatters';

type Props = {
  dashboard: Dashboard | null;
  loading: boolean;
};

export default function DashboardPage({ dashboard, loading }: Props) {
  if (loading) return <section className="panel">Cargando dashboard...</section>;
  if (!dashboard) return <section className="panel">Sin datos disponibles.</section>;

  const { summary } = dashboard;

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span>Resumen general</span>
          <h2>{formatMoney(summary.amountCrc, 'CRC')}</h2>
          <p>{formatMoney(summary.amountUsd, 'USD')} · {summary.count} gasto(s)</p>
        </div>
        <div className="exchange-card">
          <span>Venta USD/CRC</span>
          <strong>{summary.exchangeRate.rate ? formatMoney(summary.exchangeRate.rate, 'CRC') : 'No configurado'}</strong>
          <small>{summary.exchangeRate.source} · BCCR {summary.exchangeRate.indicator} · {summary.exchangeRate.date}</small>
        </div>
      </section>

      {summary.conversionIssues.length > 0 && (
        <section className="notice error">
          <strong>Conversión incompleta.</strong>
          <span>{summary.conversionIssues.length} gasto(s) no tienen conversión completa.</span>
        </section>
      )}

      <section className="metric-row">
        <article>
          <span>Total CRC</span>
          <strong>{formatMoney(summary.amountCrc, 'CRC')}</strong>
        </article>
        <article>
          <span>Total USD</span>
          <strong>{formatMoney(summary.amountUsd, 'USD')}</strong>
        </article>
        <article>
          <span>Promedio CRC</span>
          <strong>{formatMoney(summary.averageCrc, 'CRC')}</strong>
        </article>
        <article>
          <span>Por revisar</span>
          <strong>{summary.needsReview}</strong>
        </article>
      </section>

      <div className="dashboard-grid pro-grid">
        <section className="panel feature-panel">
          <div className="section-title">
            <h2>Distribución por categoría</h2>
            <p>Participación del gasto total convertido a colones.</p>
          </div>
          <CategoryPieChart data={dashboard.byCategory} />
        </section>

        <section className="panel">
          <div className="section-title">
            <h2>Gasto por mes</h2>
            <p>Evolución mensual convertida a colones.</p>
          </div>
          <MonthlyBarChart data={dashboard.byMonth} />
        </section>

        <section className="panel">
          <div className="section-title">
            <h2>Por moneda original</h2>
            <p>Montos capturados antes de convertir.</p>
          </div>
          <CurrencyBreakdown data={dashboard.byCurrency} />
        </section>

        <section className="panel">
          <div className="section-title">
            <h2>Top comercios</h2>
            <p>Ranking convertido a colones.</p>
          </div>
          <BarList items={dashboard.byMerchant.map((item) => ({ label: item.merchant, value: item.amountCrc, secondaryValue: item.amountUsd }))} />
        </section>

        <section className="panel">
          <div className="section-title">
            <h2>Categorías</h2>
            <p>Ranking por monto total.</p>
          </div>
          <BarList items={dashboard.byCategory.map((item) => ({ label: item.category, value: item.amountCrc, secondaryValue: item.amountUsd }))} />
        </section>

        <section className="panel">
          <div className="section-title">
            <h2>Métodos de pago</h2>
            <p>Distribución según lo detectado en la fuente.</p>
          </div>
          <BarList items={dashboard.paymentMethods.map((item) => ({ label: item.method, value: item.amountCrc, secondaryValue: item.amountUsd }))} />
        </section>
      </div>

      <section className="panel">
        <div className="section-title">
          <h2>Gastos recientes</h2>
          <p>Últimos movimientos guardados en PostgreSQL.</p>
        </div>
        <ExpensesTable expenses={dashboard.recentExpenses.slice(0, 8)} />
      </section>
    </div>
  );
}
