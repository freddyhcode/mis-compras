import { yearMonthTotals } from './stats';

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
