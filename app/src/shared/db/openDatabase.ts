import * as SQLite from 'expo-sqlite';

import { getOrCreateDatabaseKey } from '@/shared/crypto/dbKey';
import type { DataMode } from '@/shared/runtime/environment';

export const DB_NAME = 'mis-compras.db';

export interface OpenDatabaseResult {
  db: SQLite.SQLiteDatabase;
  mode: DataMode;
}

export async function openAppDatabase(): Promise<OpenDatabaseResult> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  let cipher: { cipher_version?: string } | null = null;
  try {
    cipher = await db.getFirstAsync<{ cipher_version?: string }>('PRAGMA cipher_version');
  } catch {
    cipher = null;
  }

  if (cipher?.cipher_version) {
    const key = await getOrCreateDatabaseKey();
    await db.execAsync(`PRAGMA key = "x'${key}'"`);

    try {
      await db.getFirstAsync('SELECT count(*) FROM sqlite_master');
    } catch {
      await db.closeAsync();
      throw new Error(
        'No pudimos abrir tus datos. La clave no coincide con la base. Puedes borrar todos los datos para empezar de nuevo.',
      );
    }

    await db.execAsync(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
      PRAGMA secure_delete = ON;
    `);

    return { db, mode: 'encrypted' };
  }

  if (!__DEV__) {
    await db.closeAsync();
    throw new Error(
      'El cifrado no está disponible en este build. Por seguridad, la app no abre la base sin cifrado.',
    );
  }

  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
  `);

  return { db, mode: 'plain-dev' };
}
