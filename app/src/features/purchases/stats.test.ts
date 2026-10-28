import { purchasesInSeries, topCategories, yearMonthTotals } from './stats';
import type { MonthTotal } from './stats';
import type { Purchase } from './types';

function purchase(id: string, purchasedAt: string, category: Purchase['category']): Purchase {
  return {
    id,
    title: `Compra ${id}`,
    purchasedAt,
    category,
    createdAt: `${purchasedAt}T12:00:00.000Z`,
    updatedAt: `${purchasedAt}T12:00:00.000Z`,
    items: [
      {
        id: `i-${id}`,
        purchaseId: id,
        name: 'Producto',
        quantityMilli: 1000,
        unit: 'un',
        unitPriceClp: 1000,
        position: 0,
        createdAt: `${purchasedAt}T12:00:00.000Z`,
        updatedAt: `${purchasedAt}T12:00:00.000Z`,
      },
    ],
  };
}

describe('yearMonthTotals', () => {
  it('ordena los meses de enero a diciembre', () => {
    const months = yearMonthTotals([], 2026, 'es');

    expect(months).toHaveLength(12);
    expect(months[0]?.label).toBe('Enero 2026');
    expect(months[11]?.label).toBe('Diciembre 2026');
  });

  it('usa los nombres de meses en inglés', () => {
    const months = yearMonthTotals([], 2026, 'en');

    expect(months[0]?.label).toBe('January 2026');
    expect(months[11]?.label).toBe('December 2026');
  });
});

describe('purchasesInSeries', () => {
  const purchases: Purchase[] = [
    purchase('a', '2026-01-15', 'supermercado'),
    purchase('b', '2026-03-10', 'online'),
    purchase('c', '2026-10-05', 'supermercado'),
  ];

  const series: MonthTotal[] = [
    { key: '2026-09', label: 'Septiembre 2026', total: 0, count: 0, products: 0 },
    { key: '2026-10', label: 'Octubre 2026', total: 0, count: 0, products: 0 },
  ];

  it('deja solo las compras del período visible', () => {
    const filtered = purchasesInSeries(purchases, series);

    expect(filtered.map((item) => item.id)).toEqual(['c']);
  });

  it('hace que las categorías cambien según el período', () => {
    const short = topCategories(purchasesInSeries(purchases, series));
    const byCategory = Object.fromEntries(short.map((item) => [item.category, item.total]));

    expect(byCategory.supermercado).toBe(1000);
    expect(byCategory.online).toBe(0);
    expect(byCategory.otros).toBe(0);
  });
});
