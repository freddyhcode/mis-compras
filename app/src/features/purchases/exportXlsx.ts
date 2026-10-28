import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import writeXlsxFile, { type SheetData } from 'write-excel-file/universal';

import type { Strings } from '@/i18n/es';
import { formatDate } from '@/shared/utils/date';

import { categoryLabel, purchaseTotalClp, unitLabel } from './format';
import type { Purchase } from './types';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const XLSX_UTI = 'org.openxmlformats.spreadsheetml.sheet';

const header = (value: string) => ({
  value,
  fontWeight: 'bold' as const,
  backgroundColor: '#F0EAF7',
  textColor: '#2F2A36',
  borderColor: '#D9CDE8',
  borderStyle: 'thin' as const,
});

const money = (value: number) => ({
  value,
  type: Number,
  format: '"$"#,##0',
});

const quantity = (value: number) => ({
  value,
  type: Number,
  format: '#,##0.###',
});

function safeText(value: string): string {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function buildSummarySheet(purchases: Purchase[], strings: Strings): SheetData {
  const e = strings.export;
  const total = purchases.reduce((sum, purchase) => sum + purchaseTotalClp(purchase), 0);
  const count = purchases.length;
  const products = purchases.reduce((sum, purchase) => sum + purchase.items.length, 0);
  const average = count > 0 ? Math.round(total / count) : 0;

  return [
    [header(e.summary), header(strings.common.total)],
    [e.purchasesRegistered, count],
    [e.productsRegistered, products],
    [e.totalSpent, money(total)],
    [e.average, money(average)],
    [e.exportedAt, formatDate(new Date().toISOString().slice(0, 10))],
  ] as SheetData;
}

function buildPurchasesSheet(purchases: Purchase[], strings: Strings): SheetData {
  const e = strings.export;
  const headerRow = [
    e.title,
    e.date,
    e.place,
    e.category,
    e.productsCount,
    e.total,
    e.notes,
  ].map(header);

  const rows = purchases.map((purchase) => [
    safeText(purchase.title),
    formatDate(purchase.purchasedAt),
    safeText(purchase.merchant ?? ''),
    safeText(categoryLabel(purchase.category, strings)),
    purchase.items.length,
    money(purchaseTotalClp(purchase)),
    safeText(purchase.notes ?? ''),
  ]);

  return [headerRow, ...rows] as SheetData;
}

function buildProductsSheet(purchases: Purchase[], strings: Strings): SheetData {
  const e = strings.export;
  const headerRow = [
    e.purchases,
    e.product,
    e.quantity,
    e.unit,
    e.unitPrice,
    e.subtotal,
  ].map(header);

  const rows = purchases.flatMap((purchase) =>
    purchase.items.map((item) => [
      safeText(purchase.title),
      safeText(item.name),
      quantity(item.quantityMilli / 1000),
      unitLabel(item.unit, item.quantityMilli, strings),
      money(item.unitPriceClp),
      money(Math.round((item.quantityMilli * item.unitPriceClp) / 1000)),
    ]),
  );

  return [headerRow, ...rows] as SheetData;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const ReaderCtor = (globalThis as unknown as {
      FileReader?: new () => {
        result: string | ArrayBuffer | null;
        error: unknown;
        onloadend: (() => void) | null;
        onerror: (() => void) | null;
        readAsDataURL: (value: Blob) => void;
      };
    }).FileReader;

    if (!ReaderCtor) {
      reject(new Error('No pudimos preparar el archivo Excel.'));
      return;
    }

    const reader = new ReaderCtor();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('No pudimos preparar el archivo Excel.'));
        return;
      }
      const base64 = reader.result.split(',')[1];
      if (!base64) {
        reject(new Error('No pudimos preparar el archivo Excel.'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('No pudimos preparar el archivo Excel.'));
    reader.readAsDataURL(blob);
  });
}

async function downloadOnWeb(blob: Blob, fileName: string): Promise<void> {
  const browser = globalThis as unknown as {
    document?: {
      createElement: (tag: string) => {
        href: string;
        download: string;
        click: () => void;
      };
    };
    URL?: { createObjectURL: (blob: Blob) => string; revokeObjectURL: (url: string) => void };
  };

  if (!browser.document || !browser.URL) {
    throw new Error('La descarga no está disponible en este navegador.');
  }

  const url = browser.URL.createObjectURL(blob);
  const anchor = browser.document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  browser.URL.revokeObjectURL(url);
}

export async function exportPurchasesToXlsx(
  purchases: Purchase[],
  strings: Strings,
): Promise<void> {
  const blob = await writeXlsxFile(
    [
      {
        data: buildSummarySheet(purchases, strings),
        sheet: strings.export.summary,
        columns: [{ width: 28 }, { width: 18 }],
      },
      {
        data: buildPurchasesSheet(purchases, strings),
        sheet: strings.export.purchases,
        columns: [
          { width: 28 },
          { width: 14 },
          { width: 22 },
          { width: 18 },
          { width: 12 },
          { width: 16 },
          { width: 36 },
        ],
        stickyRowsCount: 1,
      },
      {
        data: buildProductsSheet(purchases, strings),
        sheet: strings.export.products,
        columns: [
          { width: 28 },
          { width: 28 },
          { width: 12 },
          { width: 10 },
          { width: 22 },
          { width: 18 },
        ],
        stickyRowsCount: 1,
      },
    ],
    { fontFamily: 'Calibri', fontSize: 11 },
  ).toBlob();

  const date = new Date().toISOString().slice(0, 10);
  const fileName = `mis-compras-${date}.xlsx`;

  if (Platform.OS === 'web') {
    await downloadOnWeb(blob, fileName);
    return;
  }

  const base64 = await blobToBase64(blob);
  const directory = FileSystem.cacheDirectory;
  if (!directory) throw new Error('No pudimos preparar el archivo Excel.');

  const uri = `${directory}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Compartir archivos no está disponible en este dispositivo.');
  }

  await Sharing.shareAsync(uri, {
    mimeType: XLSX_MIME,
    UTI: XLSX_UTI,
    dialogTitle: strings.settings.export,
  });
}
