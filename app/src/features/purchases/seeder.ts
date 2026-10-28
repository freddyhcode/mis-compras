import type {
  Category,
  Purchase,
  PurchaseInput,
  PurchaseItemInput,
} from './types';

interface SeedPurchase {
  title: string;
  purchasedAt: string;
  merchant: string;
  category: Category;
  notes?: string;
  products: PurchaseItemInput[];
}

function dateMonthsAgo(monthsAgo: number, day: number): string {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, day);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function product(
  name: string,
  quantityMilli: number,
  unit: PurchaseItemInput['unit'],
  unitPriceClp: number,
): PurchaseItemInput {
  return { name, quantityMilli, unit, unitPriceClp };
}

export function buildSeedPurchases(): SeedPurchase[] {
  return [
    {
      title: 'Súper de la semana',
      purchasedAt: dateMonthsAgo(0, 12),
      merchant: 'Lider',
      category: 'supermercado',
      notes: 'Compra semanal',
      products: [
        product('Leche', 2000, 'un', 1250),
        product('Arroz', 1000, 'kg', 1890),
        product('Jugo', 750, 'L', 2400),
        product('Pan', 1000, 'un', 2200),
      ],
    },
    {
      title: 'Audífonos Bluetooth',
      purchasedAt: dateMonthsAgo(0, 4),
      merchant: 'Mercado Libre',
      category: 'online',
      products: [
        product('Audífonos', 1000, 'un', 29990),
        product('Envío', 1000, 'un', 3990),
      ],
    },
    {
      title: 'Aseo del mes',
      purchasedAt: dateMonthsAgo(1, 20),
      merchant: 'Jumbo',
      category: 'hogar',
      products: [
        product('Detergente', 1000, 'un', 8990),
        product('Papel higiénico', 1000, 'un', 6500),
        product('Bolsas de basura', 1000, 'un', 2500),
      ],
    },
    {
      title: 'Teclado mecánico',
      purchasedAt: dateMonthsAgo(1, 8),
      merchant: 'AliExpress',
      category: 'tecnologia',
      products: [
        product('Teclado', 1000, 'un', 45990),
        product('Envío', 1000, 'un', 5990),
      ],
    },
    {
      title: 'Feria del sábado',
      purchasedAt: dateMonthsAgo(2, 17),
      merchant: 'Feria',
      category: 'supermercado',
      products: [
        product('Tomates', 1500, 'kg', 1600),
        product('Palta', 800, 'kg', 3500),
        product('Limones', 1000, 'kg', 1200),
      ],
    },
    {
      title: 'Polera y pantalón',
      purchasedAt: dateMonthsAgo(3, 9),
      merchant: 'Zara',
      category: 'ropa',
      products: [
        product('Polera', 1000, 'un', 15990),
        product('Pantalón', 1000, 'un', 29990),
      ],
    },
    {
      title: 'Libro de cocina',
      purchasedAt: dateMonthsAgo(3, 22),
      merchant: 'Buscalibre',
      category: 'online',
      products: [
        product('Libro', 1000, 'un', 18990),
        product('Envío', 1000, 'un', 3500),
      ],
    },
    {
      title: 'Lámpara de escritorio',
      purchasedAt: dateMonthsAgo(4, 14),
      merchant: 'Sodimac',
      category: 'hogar',
      products: [
        product('Lámpara', 1000, 'un', 12990),
        product('Ampolleta', 1000, 'un', 3990),
      ],
    },
    {
      title: 'Compra rápida',
      purchasedAt: dateMonthsAgo(5, 6),
      merchant: 'Santa Isabel',
      category: 'supermercado',
      products: [
        product('Café', 1000, 'un', 5990),
        product('Galletas', 2000, 'un', 1290),
        product('Yogur', 4000, 'un', 690),
      ],
    },
    {
      title: 'Cargador USB-C',
      purchasedAt: dateMonthsAgo(5, 24),
      merchant: 'Mercado Libre',
      category: 'tecnologia',
      products: [
        product('Cargador', 1000, 'un', 9990),
        product('Cable USB-C', 1000, 'un', 4990),
      ],
    },
  ];
}

export async function seedDemoData({
  createPurchase,
  addItem,
}: {
  createPurchase: (input: PurchaseInput) => Promise<Purchase>;
  addItem: (purchaseId: string, input: PurchaseItemInput) => Promise<Purchase>;
}): Promise<number> {
  const seeds = buildSeedPurchases();

  for (const seed of seeds) {
    const purchase = await createPurchase({
      title: seed.title,
      purchasedAt: seed.purchasedAt,
      merchant: seed.merchant,
      category: seed.category,
      notes: seed.notes,
    });

    for (const item of seed.products) {
      await addItem(purchase.id, item);
    }
  }

  return seeds.length;
}
