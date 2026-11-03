// Finnish money format, e.g. 3.5 -> "3,50 €", or "4 €" with 0 decimals
export const euros = (amount, decimals = 2) => amount.toLocaleString('fi-FI', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
});
