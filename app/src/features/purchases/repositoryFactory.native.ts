import { openAppDatabase } from '@/shared/db/openDatabase';
import { migrate } from '@/shared/db/migrations';

import type { AppRepository } from './repository';
import { SqliteRepository } from './sqliteRepository';

export async function createAppRepository(): Promise<AppRepository> {
  const { db, mode } = await openAppDatabase();
  await migrate(db);
  return new SqliteRepository(db, mode);
}
