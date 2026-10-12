export function formatNaira(amount: number, opts: { signed?: boolean } = {}): string {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  const sign = opts.signed ? (amount < 0 ? "-" : amount > 0 ? "+" : "") : amount < 0 ? "-" : "";
  return `${sign}₦${formatted}`;
}

export function naira(amount: number): string {
  return `₦${new Intl.NumberFormat("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount)}`;
}
