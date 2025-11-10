export function formatCurrencyBRL(value?: number) {
  if (!value) return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  } catch {
    return '-';
  }
}

export function formatInteger(value?: number | string) {
  if (value === undefined || value === null) return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  return Math.trunc(num).toString();
}
