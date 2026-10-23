// Currency, unit, and date formatting utilities

export function formatINR(amount, options = {}) {
  const num = Number(amount);
  if (isNaN(num)) return '₹0.00';

  const { maximumFractionDigits = 2, minimumFractionDigits = 2 } = options;

  // Format using Indian English locale
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits,
    maximumFractionDigits
  }).format(num);

  return formatted;
}

export function formatNumber(amount, decimals = 2) {
  const num = Number(amount);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
}

export function formatUnit(qty, unit) {
  const q = Number(qty);
  const formattedQty = isNaN(q) ? qty : formatNumber(q, 3);
  return `${formattedQty} ${unit || ''}`.trim();
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}
