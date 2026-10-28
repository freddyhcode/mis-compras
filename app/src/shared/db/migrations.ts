import type { SQLiteDatabase } from 'expo-sqlite';

export const CURRENT_SCHEMA_VERSION = 1;

export async function migrate(db: SQLiteDatabase): Promise<void> {
  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = versionRow?.user_version ?? 0;
  if (current >= CURRENT_SCHEMA_VERSION) return;

  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 80),
      purchased_at TEXT NOT NULL,
      merchant TEXT,
      category TEXT CHECK (category IN ('supermercado','online','hogar','tecnologia','ropa','otros')),
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS purchase_items (
      id TEXT PRIMARY KEY NOT NULL,
      purchase_id TEXT NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
      name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
      quantity_milli INTEGER NOT NULL CHECK (quantity_milli > 0),
      unit TEXT NOT NULL CHECK (unit IN ('un','kg','L')),
      unit_price_clp INTEGER NOT NULL CHECK (unit_price_clp >= 0),
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchased_at);
    CREATE INDEX IF NOT EXISTS idx_items_purchase ON purchase_items(purchase_id);

    PRAGMA user_version = ${CURRENT_SCHEMA_VERSION};
  `);
}
