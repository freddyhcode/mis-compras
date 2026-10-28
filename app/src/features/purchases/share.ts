import { Platform, Share } from 'react-native';

import type { Strings } from '@/i18n/es';
import type { Language } from '@/i18n/language';
import { formatDate } from '@/shared/utils/date';

import {
  categoryLabel,
  formatClp,
  formatQuantity,
  purchaseTotalClp,
  subtotalClp,
  unitLabel,
} from './format';
import type { Purchase } from './types';

export type ShareResult = 'shared' | 'copied' | 'cancelled';

export function buildPurchaseText(
  purchase: Purchase,
  strings: Strings,
  language: Language = 'es',
): string {
  const lines: (string | null)[] = [
    `${strings.appName} · ${purchase.title}`,
    `${strings.purchase.date}: ${formatDate(purchase.purchasedAt)}`,
    purchase.merchant ? `${strings.purchase.merchant}: ${purchase.merchant}` : null,
    `${strings.purchase.category}: ${categoryLabel(purchase.category, strings)}`,
    '',
    `${strings.purchase.products}:`,
    ...purchase.items.map(
      (item) =>
        `• ${formatQuantity(item.quantityMilli, item.unit, language)} ${unitLabel(
          item.unit,
          item.quantityMilli,
          strings,
        )} — ${item.name}: ${formatClp(subtotalClp(item))}`,
    ),
    '',
    `${strings.purchase.total}: ${formatClp(purchaseTotalClp(purchase))}`,
    purchase.notes ? `${strings.purchase.notes}: ${purchase.notes}` : null,
  ];

  return lines.filter((line): line is string => line !== null).join('\n');
}

export async function sharePurchase(
  purchase: Purchase,
  strings: Strings,
  language: Language = 'es',
): Promise<ShareResult> {
  const text = buildPurchaseText(purchase, strings, language);

  if (Platform.OS === 'web') {
    const browser = globalThis as unknown as {
      navigator?: {
        share?: (data: { title?: string; text?: string }) => Promise<void>;
        clipboard?: { writeText: (value: string) => Promise<void> };
      };
    };

    if (browser.navigator?.share) {
      try {
        await browser.navigator.share({ title: strings.share.title, text });
        return 'shared';
      } catch (error) {
        if ((error as { name?: string }).name === 'AbortError') return 'cancelled';
      }
    }

    if (browser.navigator?.clipboard) {
      await browser.navigator.clipboard.writeText(text);
      return 'copied';
    }

    throw new Error(strings.share.error);
  }

  const result = await Share.share({
    title: strings.share.title,
    message: text,
  });

  return result.action === Share.dismissedAction ? 'cancelled' : 'shared';
}
