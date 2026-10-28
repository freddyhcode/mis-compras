import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import writeXlsxFile, { type SheetData } from 'write-excel-file/universal';

import type { Strings } from '@/i18n/es';
import { formatDate } from '@/shared/utils/date';

import { categoryLabel, purchaseTotalClp, unitLabel } from './format';
import type { Purchase } from './types';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const XLSX_UTI = 'org.openxmlformats.spreadsheetml.sheet';

type Workbook = Parameters<typeof writeXlsxFile>[0];
type WorkbookOptions = Parameters<typeof writeXlsxFile>[1];

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

function buildWorkbook(purchases: Purchase[], strings: Strings): Workbook {
  const e = strings.export;

  return [
    {
      data: buildSummarySheet(purchases, strings),
      sheet: e.summary,
      columns: [{ width: 28 }, { width: 18 }],
    },
    {
      data: buildPurchasesSheet(purchases, strings),
      sheet: e.purchases,
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
      sheet: e.products,
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
  ] as Workbook;
}

const workbookOptions: WorkbookOptions = { fontFamily: 'Calibri', fontSize: 11 };

/**
 * React Native no puede crear `Blob` desde un `ArrayBuffer`, y `write-excel-file`
 * depende de eso. Se intercepta el constructor solo durante la generación para
 * quedarse con los bytes y escribir el archivo directo al disco.
 */
async function renderXlsxBuffer(workbook: Workbook): Promise<ArrayBuffer> {
  const scope = globalThis as unknown as { Blob: unknown };
  const OriginalBlob = scope.Blob;
  let captured: ArrayBuffer | null = null;

  class CaptureBlob {
    constructor(parts?: unknown[]) {
      const part = parts?.[0];
      if (part instanceof ArrayBuffer) {
        captured = part;
      } else if (part && ArrayBuffer.isView(part)) {
        const view = part as ArrayBufferView;
        captured = view.buffer.slice(
          view.byteOffset,
          view.byteOffset + view.byteLength,
        ) as ArrayBuffer;
      }
    }
  }

  scope.Blob = CaptureBlob;
  try {
    await writeXlsxFile(workbook, workbookOptions).toBlob();
  } finally {
    scope.Blob = OriginalBlob;
  }

  const buffer = captured as ArrayBuffer | null;
  if (!buffer) throw new Error('No pudimos preparar el archivo Excel.');
  return buffer;
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
  const workbook = buildWorkbook(purchases, strings);
  const date = new Date().toISOString().slice(0, 10);
  const fileName = `mis-compras-${date}.xlsx`;

  if (Platform.OS === 'web') {
    const blob = await writeXlsxFile(workbook, workbookOptions).toBlob();
    await downloadOnWeb(blob, fileName);
    return;
  }

  const buffer = await renderXlsxBuffer(workbook);
  const target = new File(Paths.cache, fileName);
  target.create({ overwrite: true });
  target.write(new Uint8Array(buffer));

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Compartir archivos no está disponible en este dispositivo.');
  }

  await Sharing.shareAsync(target.uri, {
    mimeType: XLSX_MIME,
    UTI: XLSX_UTI,
    dialogTitle: strings.settings.export,
  });
}
