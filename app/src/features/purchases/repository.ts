import type { DataMode } from '@/shared/runtime/environment';

import type { Purchase, PurchaseInput, PurchaseItemInput } from './types';

export interface SettingsRepository {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  clear(): Promise<void>;
}

export interface PurchaseRepository {
  list(): Promise<Purchase[]>;
  get(id: string): Promise<Purchase | null>;
  create(input: PurchaseInput): Promise<Purchase>;
  update(id: string, input: PurchaseInput): Promise<Purchase>;
  remove(id: string): Promise<void>;
  addItem(purchaseId: string, input: PurchaseItemInput): Promise<Purchase>;
  updateItem(
    purchaseId: string,
    itemId: string,
    input: PurchaseItemInput,
  ): Promise<Purchase>;
  removeItem(purchaseId: string, itemId: string): Promise<Purchase>;
  destroy(): Promise<void>;
}

export interface AppRepository {
  mode: DataMode;
  purchases: PurchaseRepository;
  settings: SettingsRepository;
  destroy(): Promise<void>;
}
