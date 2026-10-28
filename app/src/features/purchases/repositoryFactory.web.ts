import type { AppRepository } from './repository';
import { WebRepository } from './webRepository';

export async function createAppRepository(): Promise<AppRepository> {
  return new WebRepository();
}
