import type { AppRepository } from './repository';

export async function createAppRepository(): Promise<AppRepository> {
  throw new Error('No hay un repositorio de datos disponible en esta plataforma.');
}
