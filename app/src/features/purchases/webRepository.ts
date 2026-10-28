import { createId } from '@/shared/utils/ids';

import type { AppRepository, PurchaseRepository, SettingsRepository } from './repository';
import { purchaseInputSchema, purchaseItemInputSchema } from './schema';
import type { Purchase, PurchaseInput, PurchaseItem, PurchaseItemInput } from './types';

const STORAGE_KEY = 'mis-compras.dev.v1';
const SETTINGS_KEY = 'mis-compras.settings.v1';

const memory = new Map<string, string>();

function storageAvailable(): boolean {
  return typeof globalThis !== 'undefined' && typeof globalThis.localStorage !== 'undefined';
}

function readRaw(): string | null {
  if (storageAvailable()) return globalThis.localStorage.getItem(STORAGE_KEY);
  return memory.get(STORAGE_KEY) ?? null;
}

function writeRaw(value: string): void {
  if (storageAvailable()) {
    globalThis.localStorage.setItem(STORAGE_KEY, value);
    return;
  }
  memory.set(STORAGE_KEY, value);
}

function removeRaw(): void {
  if (storageAvailable()) globalThis.localStorage.removeItem(STORAGE_KEY);
  memory.delete(STORAGE_KEY);
}

function readSettings(): Record<string, string> {
  const raw = storageAvailable()
    ? globalThis.localStorage.getItem(SETTINGS_KEY)
    : memory.get(SETTINGS_KEY) ?? null;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function writeSettings(value: Record<string, string>): void {
  const raw = JSON.stringify(value);
  if (storageAvailable()) {
    globalThis.localStorage.setItem(SETTINGS_KEY, raw);
    return;
  }
  memory.set(SETTINGS_KEY, raw);
}

function removeSettings(): void {
  if (storageAvailable()) globalThis.localStorage.removeItem(SETTINGS_KEY);
  memory.delete(SETTINGS_KEY);
}

function readPurchases(): Purchase[] {
  const raw = readRaw();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Purchase[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePurchases(purchases: Purchase[]): void {
  writeRaw(JSON.stringify(purchases));
}

function sortPurchases(purchases: Purchase[]): Purchase[] {
  return [...purchases].sort((a, b) => {
    const byDate = b.purchasedAt.localeCompare(a.purchasedAt);
    return byDate !== 0 ? byDate : b.createdAt.localeCompare(a.createdAt);
  });
}

class WebPurchaseRepository implements PurchaseRepository {
  async list(): Promise<Purchase[]> {
    return sortPurchases(readPurchases());
  }

  async get(id: string): Promise<Purchase | null> {
    return readPurchases().find((purchase) => purchase.id === id) ?? null;
  }

  async create(input: PurchaseInput): Promise<Purchase> {
    const parsed = purchaseInputSchema.parse(input);
    const now = new Date().toISOString();
    const purchase: Purchase = {
      id: createId(),
      title: parsed.title,
      purchasedAt: parsed.purchasedAt,
      merchant: parsed.merchant?.trim() || undefined,
      category: parsed.category,
      notes: parsed.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
      items: [],
    };
    writePurchases([purchase, ...readPurchases()]);
    return purchase;
  }

  async update(id: string, input: PurchaseInput): Promise<Purchase> {
    const parsed = purchaseInputSchema.parse(input);
    const purchases = readPurchases();
    const existing = purchases.find((purchase) => purchase.id === id);
    if (!existing) throw new Error('No encontramos esa compra.');

    const updated: Purchase = {
      ...existing,
      title: parsed.title,
      purchasedAt: parsed.purchasedAt,
      merchant: parsed.merchant?.trim() || undefined,
      category: parsed.category,
      notes: parsed.notes?.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    writePurchases(purchases.map((purchase) => (purchase.id === id ? updated : purchase)));
    return updated;
  }

  async remove(id: string): Promise<void> {
    writePurchases(readPurchases().filter((purchase) => purchase.id !== id));
  }

  async addItem(purchaseId: string, input: PurchaseItemInput): Promise<Purchase> {
    const parsed = purchaseItemInputSchema.parse(input);
    const purchases = readPurchases();
    const existing = purchases.find((purchase) => purchase.id === purchaseId);
    if (!existing) throw new Error('No encontramos esa compra.');

    const now = new Date().toISOString();
    const item: PurchaseItem = {
      id: createId(),
      purchaseId,
      name: parsed.name,
      quantityMilli: parsed.quantityMilli,
      unit: parsed.unit,
      unitPriceClp: parsed.unitPriceClp,
      position: existing.items.length,
      createdAt: now,
      updatedAt: now,
    };
    const updated: Purchase = {
      ...existing,
      updatedAt: now,
      items: [...existing.items, item],
    };
    writePurchases(purchases.map((purchase) => (purchase.id === purchaseId ? updated : purchase)));
    return updated;
  }

  async updateItem(
    purchaseId: string,
    itemId: string,
    input: PurchaseItemInput,
  ): Promise<Purchase> {
    const parsed = purchaseItemInputSchema.parse(input);
    const purchases = readPurchases();
    const existing = purchases.find((purchase) => purchase.id === purchaseId);
    if (!existing) throw new Error('No encontramos esa compra.');

    const now = new Date().toISOString();
    const updated: Purchase = {
      ...existing,
      updatedAt: now,
      items: existing.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              name: parsed.name,
              quantityMilli: parsed.quantityMilli,
              unit: parsed.unit,
              unitPriceClp: parsed.unitPriceClp,
              updatedAt: now,
            }
          : item,
      ),
    };
    writePurchases(purchases.map((purchase) => (purchase.id === purchaseId ? updated : purchase)));
    return updated;
  }

  async removeItem(purchaseId: string, itemId: string): Promise<Purchase> {
    const purchases = readPurchases();
    const existing = purchases.find((purchase) => purchase.id === purchaseId);
    if (!existing) throw new Error('No encontramos esa compra.');

    const updated: Purchase = {
      ...existing,
      updatedAt: new Date().toISOString(),
      items: existing.items.filter((item) => item.id !== itemId),
    };
    writePurchases(purchases.map((purchase) => (purchase.id === purchaseId ? updated : purchase)));
    return updated;
  }

  async destroy(): Promise<void> {
    removeRaw();
  }
}

export class WebRepository implements AppRepository {
  readonly mode = 'web-dev' as const;
  readonly purchases = new WebPurchaseRepository();
  readonly settings: SettingsRepository = {
    get: async (key) => readSettings()[key] ?? null,
    set: async (key, value) => {
      writeSettings({ ...readSettings(), [key]: value });
    },
    clear: async () => {
      removeSettings();
    },
  };

  async destroy(): Promise<void> {
    await Promise.all([this.purchases.destroy(), this.settings.clear()]);
  }
}
