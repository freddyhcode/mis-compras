export type DataMode = 'encrypted' | 'plain-dev' | 'web-dev';

export function isDevDataMode(mode: DataMode | null): boolean {
  return mode !== null && mode !== 'encrypted';
}
