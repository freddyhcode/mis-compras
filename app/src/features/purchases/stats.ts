import { lastMonthKeys, monthKey, monthLabel } from '@/shared/utils/date';
import type { Language } from '@/i18n/language';

import { purchaseTotalClp } from './format';
import { CATEGORIES, type Purchase } from './types';

export interface MonthTotal {
  key: string;
  label: string;
  total: number;
  count: number;
  products: number;
}

export interface Summary {
  total: number;
  count: number;
  products: number;
  average: number;
}

export function summaryForMonth(purchases: Purchase[], now = new Date()): Summary {
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthPurchases = purchases.filter((purchase) => monthKey(purchase.purchasedAt) === key);
  const total = monthPurchases.reduce((sum, purchase) => sum + purchaseTotalClp(purchase), 0);
  const count = monthPurchases.length;
  const products = monthPurchases.reduce((sum, purchase) => sum + purchase.items.length, 0);
  return {
    total,
    count,
    products,
    average: count > 0 ? Math.round(total / count) : 0,
  };
}

export function monthTotals(
  purchases: Purchase[],
  months: number,
  language: Language = 'es',
): MonthTotal[] {
  return totalsForKeys(purchases, lastMonthKeys(months), language);
}

export function yearMonthTotals(
  purchases: Purchase[],
  year = new Date().getFullYear(),
  language: Language = 'es',
): MonthTotal[] {
  const keys = Array.from({ length: 12 }, (_, index) =>
    `${year}-${String(index + 1).padStart(2, '0')}`,
  );
  return totalsForKeys(purchases, keys, language);
}

function totalsForKeys(
  purchases: Purchase[],
  keys: string[],
  language: Language,
): MonthTotal[] {
  return keys.map((key) => {
    const matching = purchases.filter((purchase) => monthKey(purchase.purchasedAt) === key);
    return {
      key,
      label: monthLabel(key, language),
      total: matching.reduce((sum, purchase) => sum + purchaseTotalClp(purchase), 0),
      count: matching.length,
      products: matching.reduce((sum, purchase) => sum + purchase.items.length, 0),
    };
  });
}

export function purchasesInSeries(purchases: Purchase[], series: MonthTotal[]): Purchase[] {
  const keys = new Set(series.map((entry) => entry.key));
  return purchases.filter((purchase) => keys.has(monthKey(purchase.purchasedAt)));
}

export function topCategories(
  purchases: Purchase[],
  limit = CATEGORIES.length,
): { category: string; total: number }[] {
  const totals = new Map<string, number>(
    CATEGORIES.map((category) => [category, 0]),
  );
  for (const purchase of purchases) {
    const category = purchase.category ?? 'otros';
    totals.set(category, (totals.get(category) ?? 0) + purchaseTotalClp(purchase));
  }
  return Array.from(totals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function topProducts(
  purchases: Purchase[],
  limit = 5,
): { name: string; count: number; total: number }[] {
  const totals = new Map<string, { count: number; total: number }>();
  for (const purchase of purchases) {
    for (const item of purchase.items) {
      const key = item.name.trim().toLowerCase();
      const current = totals.get(key) ?? { count: 0, total: 0 };
      current.count += 1;
      current.total += Math.round((item.quantityMilli * item.unitPriceClp) / 1000);
      totals.set(key, current);
    }
  }
  return Array.from(totals.entries())
    .map(([name, value]) => ({ name, ...value }))
    .sort((a, b) => b.count - a.count || b.total - a.total)
    .slice(0, limit);
}
