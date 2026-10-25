import { fetchJson } from './fetchJson';

/**
 * Fetches data from a primary source (e.g., Google Sheets) with a fallback to local JSON.
 * Logs errors to console and returns the fallback data on failure.
 */
export async function fetchWithFallback<T>(
  primaryFetch: () => Promise<T>,
  fallbackJsonPath: string,
): Promise<T> {
  try {
    return await primaryFetch();
  } catch (error) {
    console.error(`Primary fetch failed, falling back to ${fallbackJsonPath}:`, error);
    return fetchJson<T>(fallbackJsonPath);
  }
}
