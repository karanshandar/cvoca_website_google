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
