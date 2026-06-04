import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatMoney } from '../../lib/formatters';

type Props = {
  data: Array<{
    category: string;
    amountCrc: number;
    amountUsd: number;
    count: number;
  }>;
};

const COLORS = ['#0f766e', '#2563eb', '#9333ea', '#ca8a04', '#dc2626', '#64748b', '#16a34a'];

export default function CategoryPieChart({ data }: Props) {
  if (data.length === 0) {
    return <div className="empty-state">Sin datos para graficar.</div>;
  }

  return (
    <div className="pie-layout">
      <div className="chart-box">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="amountCrc"
              nameKey="category"
              innerRadius={58}
              outerRadius={96}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatMoney(Number(value), 'CRC')} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend">
        {data.map((item, index) => (
          <div className="legend-row" key={item.category}>
            <span className="legend-dot" style={{ background: COLORS[index % COLORS.length] }} />
            <div>
              <strong>{item.category}</strong>
              <small>{formatMoney(item.amountCrc, 'CRC')} · {formatMoney(item.amountUsd, 'USD')}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
