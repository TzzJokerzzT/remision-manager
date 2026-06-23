export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
}
