import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMoney } from '../../lib/formatters';

type Props = {
  data: Array<{
    month: string;
    amountCrc: number;
    amountUsd: number;
    count: number;
  }>;
};

export default function MonthlyBarChart({ data }: Props) {
  if (data.length === 0) {
    return <div className="empty-state">Sin datos para graficar.</div>;
  }

  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="#eaecf0" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
          <Tooltip formatter={(value) => formatMoney(Number(value), 'CRC')} />
          <Bar dataKey="amountCrc" fill="#2563eb" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
