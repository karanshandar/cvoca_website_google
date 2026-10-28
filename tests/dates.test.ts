import { describe, it, expect } from 'vitest';
import { parseLocalDate } from '../utils/dates';

describe('parseLocalDate', () => {
  it('builds a YYYY-MM-DD date at local midnight, not UTC', () => {
    const date = parseLocalDate('2026-09-05');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8);
    expect(date.getDate()).toBe(5);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
  });

  it('falls back to the browser parser for other formats', () => {
    const input = '2026-09-05T10:30:00Z';
    expect(parseLocalDate(input).getTime()).toBe(new Date(input).getTime());
  });

  it('returns an invalid date for text that is not a date', () => {
    expect(Number.isNaN(parseLocalDate('TBD').getTime())).toBe(true);
  });
});
