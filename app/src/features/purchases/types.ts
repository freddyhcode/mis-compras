export const CATEGORIES = [
  'supermercado',
  'online',
  'hogar',
  'tecnologia',
  'ropa',
  'otros',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const UNITS = ['un', 'kg', 'L'] as const;

export type Unit = (typeof UNITS)[number];

export interface PurchaseItem {
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

export interface Purchase {
  id: string;
  title: string;
  purchasedAt: string;
  merchant?: string;
  category?: Category;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseItem[];
}

export interface PurchaseInput {
  title: string;
  purchasedAt: string;
  merchant?: string;
  category?: Category;
  notes?: string;
}

export interface PurchaseItemInput {
  name: string;
  quantityMilli: number;
  unit: Unit;
  unitPriceClp: number;
}
