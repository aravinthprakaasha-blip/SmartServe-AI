import { DemandStatus, StockStatus, PurchasePriority } from '../types';

/**
 * Format numbers into Indian Rupee style, e.g. ₹1,24,500
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  const rounded = Math.round(amount);
  return '₹' + rounded.toLocaleString('en-IN');
}

/**
 * Format standard numbers
 */
export function formatNumber(val: number): string {
  if (isNaN(val)) return '0';
  return val.toLocaleString('en-IN');
}

/**
 * Format a date nicely
 */
export function formatDate(dateString?: string): string {
  const d = dateString ? new Date(dateString) : new Date();
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Dynamic greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Status color utilities
 */
export function getDemandBadgeClass(status: DemandStatus): string {
  switch (status) {
    case 'High':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
    case 'Medium':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';
    case 'Low':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

export function getStockStatusBadgeClass(status: StockStatus): string {
  switch (status) {
    case 'In Stock':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
    case 'Low Stock':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';
    case 'Critical':
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20 animate-pulse';
    case 'Overstocked':
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

export function getPurchasePriorityBadgeClass(priority: PurchasePriority): string {
  switch (priority) {
    case 'HIGH':
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20 font-semibold';
    case 'MEDIUM':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';
    case 'LOW':
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

export function getRiskLevelBadgeClass(risk: 'HIGH' | 'MEDIUM' | 'LOW'): string {
  switch (risk) {
    case 'HIGH':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'MEDIUM':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'LOW':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

/**
 * Browser CSV export simulator / downloader
 */
export function exportToCSV(filename: string, rows: Record<string, unknown>[]): void {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            const raw = row[k];
            let cellStr = raw === null || raw === undefined ? '' : String(raw);
            if (raw instanceof Date) {
              cellStr = raw.toLocaleString();
            }
            cellStr = cellStr.replace(/"/g, '""');
            if (cellStr.search(/("|,|\n)/g) >= 0) {
              cellStr = `"${cellStr}"`;
            }
            return cellStr;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
