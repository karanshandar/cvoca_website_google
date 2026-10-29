import { fetchJson } from './fetchJson';
import { SheetsNotConfiguredError } from './googleSheets';
import { normalizeRows } from './normalize';

/**
 * Fetches rows from a primary source (e.g., Google Sheets) with a fallback to local JSON.
 * Logs errors to console and returns the fallback rows on failure, run through the
 * same `toItem` normaliser as the primary source so both give the same shape.
 * A missing Sheets configuration (local dev, previews) falls back without logging.
 */
export async function fetchWithFallback<T>(
  primaryFetch: () => Promise<T[]>,
  fallbackJsonPath: string,
  toItem: (row: unknown) => T | null,
): Promise<T[]> {
  try {
    return await primaryFetch();
  } catch (error) {
    if (!(error instanceof SheetsNotConfiguredError)) {
      console.error(`Primary fetch failed, falling back to ${fallbackJsonPath}:`, error);
    }
    return normalizeRows(fallbackJsonPath, await fetchJson<unknown>(fallbackJsonPath), toItem);
  }
}
