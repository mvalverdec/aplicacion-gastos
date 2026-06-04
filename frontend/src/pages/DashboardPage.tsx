import type { Dashboard } from '../types/dashboard';
import BarList from '../components/charts/BarList';
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
    <div className="dashboard-grid">
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
          <span>Gastos</span>
          <strong>{summary.count}</strong>
        </article>
        <article>
          <span>Por revisar</span>
          <strong>{summary.needsReview}</strong>
        </article>
      </section>

      <section className="panel exchange-panel">
        <div>
          <span>Tipo de cambio venta USD/CRC</span>
          <strong>{summary.exchangeRate.rate ? formatMoney(summary.exchangeRate.rate, 'CRC') : 'No configurado'}</strong>
        </div>
        <p>
          Fuente: {summary.exchangeRate.source} · Indicador BCCR {summary.exchangeRate.indicator} · {summary.exchangeRate.date}
        </p>
        {summary.conversionIssues.length > 0 && (
          <p>{summary.conversionIssues.length} gasto(s) no tienen conversión completa.</p>
        )}
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>Por categoría</h2>
        </div>
        <BarList items={dashboard.byCategory.map((item) => ({ label: item.category, value: item.amountCrc, secondaryValue: item.amountUsd }))} />
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>Por mes</h2>
        </div>
        <BarList items={dashboard.byMonth.map((item) => ({ label: item.month, value: item.amountCrc, secondaryValue: item.amountUsd }))} />
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>Top comercios</h2>
        </div>
        <BarList items={dashboard.byMerchant.map((item) => ({ label: item.merchant, value: item.amountCrc, secondaryValue: item.amountUsd }))} />
      </section>
    </div>
  );
}
