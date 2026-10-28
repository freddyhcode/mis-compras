const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function todayIsoDate(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}-${month}-${year}`;
}

export function formatDateTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return isoDateTime;
  return `${formatDate(date.toISOString().slice(0, 10))} ${date
    .toISOString()
    .slice(11, 16)}`;
}

export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function monthLabel(key: string, language: 'es' | 'en' = 'es'): string {
  const [year, month] = key.split('-');
  const index = Number(month) - 1;
  const months = language === 'en' ? MONTHS_EN : MONTHS_ES;
  const name = months[index] ?? month;
  const label = language === 'en' ? name : `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  return `${label} ${year ?? ''}`.trim();
}

export function lastMonthKeys(count: number, from = new Date()): string[] {
  const keys: string[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  for (let index = 0; index < count; index += 1) {
    const year = cursor.getFullYear();
    const month = String(cursor.getMonth() + 1).padStart(2, '0');
    keys.push(`${year}-${month}`);
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return keys.reverse();
}
