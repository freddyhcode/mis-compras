import { buildSeedPurchases, seedDemoData } from './seeder';
import type { Purchase, PurchaseInput, PurchaseItemInput } from './types';

describe('seeder', () => {
  it('genera compras de ejemplo con productos', () => {
    const seeds = buildSeedPurchases();
    expect(seeds.length).toBe(10);
    expect(seeds.every((seed) => seed.products.length > 0)).toBe(true);
    expect(seeds.some((seed) => seed.category === 'supermercado')).toBe(true);
    expect(seeds.some((seed) => seed.category === 'online')).toBe(true);
    expect(seeds.some((seed) => seed.category === 'tecnologia')).toBe(true);
  });

  it('carga todas las compras en el repositorio', async () => {
    const purchases: Purchase[] = [];

    const createPurchase = async (input: PurchaseInput): Promise<Purchase> => {
      const now = new Date().toISOString();
      const purchase: Purchase = {
        id: `purchase-${purchases.length + 1}`,
        title: input.title,
        purchasedAt: input.purchasedAt,
        merchant: input.merchant,
        category: input.category,
        notes: input.notes,
        createdAt: now,
        updatedAt: now,
        items: [],
      };
      purchases.push(purchase);
      return purchase;
    };

    const addItem = async (
      purchaseId: string,
      input: PurchaseItemInput,
    ): Promise<Purchase> => {
      const purchase = purchases.find((item) => item.id === purchaseId);
      if (!purchase) throw new Error('Compra no encontrada');
      const now = new Date().toISOString();
      purchase.items.push({
        id: `${purchaseId}-item-${purchase.items.length + 1}`,
        purchaseId,
        name: input.name,
        quantityMilli: input.quantityMilli,
        unit: input.unit,
        unitPriceClp: input.unitPriceClp,
        position: purchase.items.length,
        createdAt: now,
        updatedAt: now,
      });
      return purchase;
    };

    const count = await seedDemoData({ createPurchase, addItem });

    expect(count).toBe(10);
    expect(purchases).toHaveLength(10);
    expect(purchases.every((purchase) => purchase.items.length > 0)).toBe(true);
  });
});
