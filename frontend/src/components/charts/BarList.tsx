type BarItem = {
  label: string;
  value: number;
  secondaryValue?: number;
};

type Props = {
  items: BarItem[];
};

export default function BarList({ items }: Props) {
  const max = Math.max(...items.map((item) => item.value), 0);

  if (items.length === 0) {
    return <div className="empty-state">Sin datos para graficar.</div>;
  }

  return (
    <div className="bar-list">
      {items.map((item) => {
        const width = max > 0 ? Math.max((item.value / max) * 100, 4) : 0;
        return (
          <div className="bar-row" key={item.label}>
            <div className="bar-meta">
              <span>{item.label}</span>
              <strong>
                {item.value.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}
                {item.secondaryValue !== undefined && (
                  <small>{item.secondaryValue.toLocaleString('es-CR', { style: 'currency', currency: 'USD' })}</small>
                )}
              </strong>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
