import {
  formatClp,
  formatQuantity,
  parseClpInput,
  parseQuantityInput,
  purchaseTotalClp,
  subtotalClp,
} from './format';
import type { Purchase } from './types';

const purchase: Purchase = {
  id: 'p1',
  title: 'Compra',
  purchasedAt: '2026-10-28',
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

describe('format', () => {
  it('formatea CLP sin decimales', () => {
    expect(formatClp(1250)).toBe('$1.250');
    expect(formatClp(0)).toBe('$0');
  });

  it('calcula subtotales con cantidades en milésimas', () => {
    expect(subtotalClp(purchase.items[0])).toBe(2500);
    expect(subtotalClp(purchase.items[1])).toBe(2835);
  });

  it('suma el total de la compra', () => {
    expect(purchaseTotalClp(purchase)).toBe(5335);
  });

  it('formatea cantidades', () => {
    expect(formatQuantity(2000, 'un')).toBe('2');
    expect(formatQuantity(1500, 'kg')).toBe('1,5');
  });

  it('parsea entradas de precio y cantidad', () => {
    expect(parseClpInput('$1.250')).toBe(1250);
    expect(parseQuantityInput('1,5')).toBe(1500);
    expect(parseQuantityInput('0')).toBe(0);
  });
});
