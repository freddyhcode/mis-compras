import type { Strings } from '@/i18n/es';

import { CATEGORIES, UNITS, type Category, type Purchase, type PurchaseItem, type Unit } from './types';

export function categoryOptions(strings: Strings) {
  return CATEGORIES.map((value) => ({ value, label: strings.categories[value] }));
}

export function unitOptions(strings: Strings) {
  return UNITS.map((value) => ({ value, label: strings.units[value] }));
}

export function formatClp(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? '-' : '';
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}$${digits}`;
}

export function subtotalClp(item: PurchaseItem): number {
  return Math.round((item.quantityMilli * item.unitPriceClp) / 1000);
}

export function purchaseTotalClp(purchase: Purchase): number {
  return purchase.items.reduce((total, item) => total + subtotalClp(item), 0);
}

export function formatQuantity(
  quantityMilli: number,
  unit: Unit,
  language: 'es' | 'en' = 'es',
): string {
  if (unit === 'un') {
    return String(Math.round(quantityMilli / 1000));
  }
  const value = quantityMilli / 1000;
  const text = value
    .toFixed(3)
    .replace(/\.?0+$/, '');
  return language === 'en' ? text : text.replace('.', ',');
}

export function formatQuantityInput(
  quantityMilli: number,
  language: 'es' | 'en' = 'es',
): string {
  const text = (quantityMilli / 1000)
    .toFixed(3)
    .replace(/\.?0+$/, '');
  return language === 'en' ? text : text.replace('.', ',');
}

export function parseClpInput(text: string): number {
  const digits = text.replace(/[^\d]/g, '');
  if (!digits) return 0;
  const value = Number(digits);
  return Number.isFinite(value) ? Math.round(value) : 0;
}

export function parseQuantityInput(text: string): number {
  const normalized = text.replace(',', '.').replace(/[^\d.]/g, '');
  if (!normalized) return 0;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.round(value * 1000);
}

export function categoryLabel(
  category: Category | undefined,
  strings: Strings,
): string {
  return category ? strings.categories[category] : strings.categories.otros;
}

export function unitLabel(
  unit: Unit,
  quantityMilli: number,
  strings: Strings,
): string {
  const names = strings.unitNames[unit];
  return quantityMilli === 1000 ? names.one : names.other;
}
