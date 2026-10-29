import { describe, it, expect } from 'vitest';
import { parseLocalDate, toIsoDate } from '../utils/dates';

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

describe('toIsoDate', () => {
  it('keeps a YYYY-MM-DD date', () => {
    expect(toIsoDate('2026-09-05')).toBe('2026-09-05');
  });

  it('reads D/M/YYYY as day/month/year and zero-pads it', () => {
    expect(toIsoDate('5/9/2026')).toBe('2026-09-05');
    expect(toIsoDate('25/12/2026')).toBe('2026-12-25');
  });

  it('rejects impossible dates', () => {
    expect(toIsoDate('31/02/2026')).toBeNull();
    expect(toIsoDate('2026-13-01')).toBeNull();
  });

  it('rejects other formats and empty text', () => {
    expect(toIsoDate('5 Sep 2026')).toBeNull();
    expect(toIsoDate('05-09-2026')).toBeNull();
    expect(toIsoDate('')).toBeNull();
  });
});
