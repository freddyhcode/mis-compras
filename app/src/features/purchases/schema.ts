import { z } from 'zod';

import { CATEGORIES, UNITS } from './types';

export const purchaseInputSchema = z.object({
  title: z.string().trim().min(1, 'Escribe un título.').max(80),
  purchasedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato AAAA-MM-DD.'),
  merchant: z.string().trim().max(80).optional(),
  category: z.enum(CATEGORIES).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const purchaseItemInputSchema = z.object({
  name: z.string().trim().min(1, 'Escribe un nombre.').max(80),
  quantityMilli: z.number().int().positive('La cantidad debe ser mayor que 0.'),
  unit: z.enum(UNITS),
  unitPriceClp: z.number().int().min(0, 'El precio no puede ser negativo.'),
});
