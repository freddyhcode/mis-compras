import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import { deleteDatabaseKey } from '@/shared/crypto/dbKey';
import { DB_NAME } from '@/shared/db/openDatabase';
import type { DataMode } from '@/shared/runtime/environment';
import { createId } from '@/shared/utils/ids';

import type { AppRepository, PurchaseRepository, SettingsRepository } from './repository';
import { purchaseInputSchema, purchaseItemInputSchema } from './schema';
import type {
  Category,
  Purchase,
  PurchaseInput,
  PurchaseItem,
  PurchaseItemInput,
  Unit,
} from './types';

interface PurchaseRow {
  id: string;
  title: string;
  purchasedAt: string;
  merchant: string | null;
  category: Category | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ItemRow {
  id: string;
  purchaseId: string;
  name: string;
  quantityMilli: number;
  unit: Unit;
  unitPriceClp: number;
  position: number;
  createdAt: string;
  updatedAt: string;
}

function toPurchase(row: PurchaseRow, items: PurchaseItem[]): Purchase {
  return {
    id: row.id,
    title: row.title,
    purchasedAt: row.purchasedAt,
    merchant: row.merchant ?? undefined,
    category: row.category ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    items,
  };
}

function toItem(row: ItemRow): PurchaseItem {
  return {
    id: row.id,
    purchaseId: row.purchaseId,
    name: row.name,
    quantityMilli: row.quantityMilli,
    unit: row.unit,
    unitPriceClp: row.unitPriceClp,
    position: row.position,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

class SqlitePurchaseRepository implements PurchaseRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async list(): Promise<Purchase[]> {
    const rows = await this.db.getAllAsync<PurchaseRow>(
      `SELECT id, title, purchased_at AS purchasedAt, merchant, category, notes,
              created_at AS createdAt, updated_at AS updatedAt
       FROM purchases
       ORDER BY purchased_at DESC, created_at DESC`,
    );

    const itemRows = await this.db.getAllAsync<ItemRow>(
      `SELECT id, purchase_id AS purchaseId, name, quantity_milli AS quantityMilli,
              unit, unit_price_clp AS unitPriceClp, position,
              created_at AS createdAt, updated_at AS updatedAt
       FROM purchase_items
       ORDER BY position ASC, created_at ASC`,
    );

    const byPurchase = new Map<string, PurchaseItem[]>();
    for (const item of itemRows) {
      const list = byPurchase.get(item.purchaseId) ?? [];
      list.push(toItem(item));
      byPurchase.set(item.purchaseId, list);
    }

    return rows.map((row) => toPurchase(row, byPurchase.get(row.id) ?? []));
  }

  async get(id: string): Promise<Purchase | null> {
    const row = await this.db.getFirstAsync<PurchaseRow>(
      `SELECT id, title, purchased_at AS purchasedAt, merchant, category, notes,
              created_at AS createdAt, updated_at AS updatedAt
       FROM purchases
       WHERE id = ?`,
      id,
    );
    if (!row) return null;

    const items = await this.db.getAllAsync<ItemRow>(
      `SELECT id, purchase_id AS purchaseId, name, quantity_milli AS quantityMilli,
              unit, unit_price_clp AS unitPriceClp, position,
              created_at AS createdAt, updated_at AS updatedAt
       FROM purchase_items
       WHERE purchase_id = ?
       ORDER BY position ASC, created_at ASC`,
      id,
    );

    return toPurchase(row, items.map(toItem));
  }

  async create(input: PurchaseInput): Promise<Purchase> {
    const parsed = purchaseInputSchema.parse(input);
    const id = createId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO purchases
        (id, title, purchased_at, merchant, category, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      parsed.title,
      parsed.purchasedAt,
      parsed.merchant?.trim() || null,
      parsed.category ?? null,
      parsed.notes?.trim() || null,
      now,
      now,
    );

    const created = await this.get(id);
    if (!created) throw new Error('No pudimos crear la compra.');
    return created;
  }

  async update(id: string, input: PurchaseInput): Promise<Purchase> {
    const existing = await this.get(id);
    if (!existing) throw new Error('No encontramos esa compra.');

    const parsed = purchaseInputSchema.parse(input);
    const now = new Date().toISOString();

    await this.db.runAsync(
      `UPDATE purchases
       SET title = ?, purchased_at = ?, merchant = ?, category = ?, notes = ?, updated_at = ?
       WHERE id = ?`,
      parsed.title,
      parsed.purchasedAt,
      parsed.merchant?.trim() || null,
      parsed.category ?? null,
      parsed.notes?.trim() || null,
      now,
      id,
    );

    const updated = await this.get(id);
    if (!updated) throw new Error('No pudimos actualizar la compra.');
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM purchases WHERE id = ?', id);
  }

  async addItem(purchaseId: string, input: PurchaseItemInput): Promise<Purchase> {
    const parsed = purchaseItemInputSchema.parse(input);
    const purchase = await this.get(purchaseId);
    if (!purchase) throw new Error('No encontramos esa compra.');

    const positionRow = await this.db.getFirstAsync<{ next: number }>(
      `SELECT COALESCE(MAX(position), -1) + 1 AS next
       FROM purchase_items
       WHERE purchase_id = ?`,
      purchaseId,
    );
    const id = createId();
    const now = new Date().toISOString();

    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        `INSERT INTO purchase_items
          (id, purchase_id, name, quantity_milli, unit, unit_price_clp, position, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        purchaseId,
        parsed.name,
        parsed.quantityMilli,
        parsed.unit,
        parsed.unitPriceClp,
        positionRow?.next ?? 0,
        now,
        now,
      );
      await this.db.runAsync('UPDATE purchases SET updated_at = ? WHERE id = ?', now, purchaseId);
    });

    const updated = await this.get(purchaseId);
    if (!updated) throw new Error('No pudimos agregar el ítem.');
    return updated;
  }

  async updateItem(
    purchaseId: string,
    itemId: string,
    input: PurchaseItemInput,
  ): Promise<Purchase> {
    const parsed = purchaseItemInputSchema.parse(input);
    const existing = await this.db.getFirstAsync<{ id: string }>(
      'SELECT id FROM purchase_items WHERE id = ? AND purchase_id = ?',
      itemId,
      purchaseId,
    );
    if (!existing) throw new Error('No encontramos ese ítem.');

    const now = new Date().toISOString();
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        `UPDATE purchase_items
         SET name = ?, quantity_milli = ?, unit = ?, unit_price_clp = ?, updated_at = ?
         WHERE id = ? AND purchase_id = ?`,
        parsed.name,
        parsed.quantityMilli,
        parsed.unit,
        parsed.unitPriceClp,
        now,
        itemId,
        purchaseId,
      );
      await this.db.runAsync('UPDATE purchases SET updated_at = ? WHERE id = ?', now, purchaseId);
    });

    const updated = await this.get(purchaseId);
    if (!updated) throw new Error('No pudimos actualizar el ítem.');
    return updated;
  }

  async removeItem(purchaseId: string, itemId: string): Promise<Purchase> {
    const existing = await this.db.getFirstAsync<{ id: string }>(
      'SELECT id FROM purchase_items WHERE id = ? AND purchase_id = ?',
      itemId,
      purchaseId,
    );
    if (!existing) throw new Error('No encontramos ese ítem.');

    const now = new Date().toISOString();
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        'DELETE FROM purchase_items WHERE id = ? AND purchase_id = ?',
        itemId,
        purchaseId,
      );
      await this.db.runAsync('UPDATE purchases SET updated_at = ? WHERE id = ?', now, purchaseId);
    });

    const updated = await this.get(purchaseId);
    if (!updated) throw new Error('No pudimos eliminar el ítem.');
    return updated;
  }

  async destroy(): Promise<void> {
    await this.db.closeAsync();
    await SQLite.deleteDatabaseAsync(DB_NAME);
    await deleteDatabaseKey();
  }
}

export class SqliteRepository implements AppRepository {
  readonly purchases: PurchaseRepository;
  readonly settings: SettingsRepository;

  constructor(
    private readonly db: SQLiteDatabase,
    readonly mode: DataMode,
  ) {
    this.purchases = new SqlitePurchaseRepository(db);
    this.settings = {
      get: async (key) => {
        const row = await db.getFirstAsync<{ value: string }>(
          'SELECT value FROM settings WHERE key = ?',
          key,
        );
        return row?.value ?? null;
      },
      set: async (key, value) => {
        await db.runAsync(
          `INSERT INTO settings (key, value) VALUES (?, ?)
           ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
          key,
          value,
        );
      },
      clear: async () => {
        await db.execAsync('DELETE FROM settings');
      },
    };
  }

  async destroy(): Promise<void> {
    await this.purchases.destroy();
  }
}
