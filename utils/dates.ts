/**
 * Parses an event date. `new Date('YYYY-MM-DD')` means UTC midnight, which is the
 * previous evening west of UTC, so plain dates are built in local time instead.
 * Anything else falls back to the browser's own parsing.
 */
export function parseLocalDate(date: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    return new Date(date);
  }
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/**
 * Reads a date typed as `YYYY-MM-DD` or `D/M/YYYY` (always day/month/year) and
 * returns it as a zero-padded `YYYY-MM-DD`. Returns null for any other format
 * or for a date that does not exist, such as 31/02/2026.
 */
export function toIsoDate(value: string): string | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const dayFirst = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  const parts = iso ? [iso[1], iso[2], iso[3]] : dayFirst ? [dayFirst[3], dayFirst[2], dayFirst[1]] : null;
  if (!parts) return null;

  const [year, month, day] = parts.map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
}
