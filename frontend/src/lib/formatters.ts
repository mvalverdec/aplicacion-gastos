export function formatMoney(value: number | null, currency: string) {
  if (value === null) return 'Sin TC';
  return value.toLocaleString('es-CR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  });
}
