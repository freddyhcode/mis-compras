import { es } from '@/i18n/es';

import { buildPurchaseText } from './share';
import type { Purchase } from './types';

const purchase: Purchase = {
  id: 'p1',
  title: 'Compra con mi hermana',
  purchasedAt: '2026-10-28',
  merchant: 'Lider',
  category: 'supermercado',
  notes: 'Dividir en partes iguales',
  createdAt: '2026-10-28T12:00:00.000Z',
  updatedAt: '2026-10-28T12:00:00.000Z',
  items: [
    {
      id: 'i1',
      purchaseId: 'p1',
      name: 'Leche',
      quantityMilli: 2000,
      unit: 'un',
      unitPriceClp: 1250,
      position: 0,
      createdAt: '2026-10-28T12:00:00.000Z',
      updatedAt: '2026-10-28T12:00:00.000Z',
    },
    {
      id: 'i2',
      purchaseId: 'p1',
      name: 'Arroz',
      quantityMilli: 1500,
      unit: 'kg',
      unitPriceClp: 1890,
      position: 1,
      createdAt: '2026-10-28T12:00:00.000Z',
      updatedAt: '2026-10-28T12:00:00.000Z',
    },
  ],
};

describe('share', () => {
  it('construye un mensaje legible con productos y total', () => {
    const text = buildPurchaseText(purchase, es, 'es');

    expect(text).toContain('Compra con mi hermana');
    expect(text).toContain('Leche');
    expect(text).toContain('2 Unidades');
    expect(text).toContain('1,5 Kilogramos');
    expect(text).toContain('$5.335');
    expect(text).toContain('Dividir en partes iguales');
  });
});
