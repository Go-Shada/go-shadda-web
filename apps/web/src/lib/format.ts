export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
