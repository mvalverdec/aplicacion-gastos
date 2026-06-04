import { formatMoney } from '../../lib/formatters';

type Props = {
  data: Array<{
    currency: string;
    amountOriginal: number;
    amountCrc: number;
    amountUsd: number;
    count: number;
  }>;
};

export default function CurrencyBreakdown({ data }: Props) {
  if (data.length === 0) {
    return <div className="empty-state">Sin datos por moneda.</div>;
  }

  return (
    <div className="currency-grid">
      {data.map((item) => (
        <article className="currency-card" key={item.currency}>
          <span>{item.currency}</span>
          <strong>{formatMoney(item.amountOriginal, item.currency)}</strong>
          <small>{formatMoney(item.amountCrc, 'CRC')} · {formatMoney(item.amountUsd, 'USD')}</small>
          <em>{item.count} gasto(s)</em>
        </article>
      ))}
    </div>
  );
}
