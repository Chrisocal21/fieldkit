/**
 * Money for display: thousands separators and a fixed number of decimals,
 * e.g. formatMoney(40845) -> "40,845.00", formatMoney(40845, 0) -> "40,845".
 * The currency symbol is left to the caller.
 */
export function formatMoney(value: number, fractionDigits = 2): string {
  return (Number.isFinite(value) ? value : 0).toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}
