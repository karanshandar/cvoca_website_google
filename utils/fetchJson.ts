/**
 * Fetches a local JSON file and parses it.
 * Throws if the response is not OK or is not JSON. Checking res.ok alone is
 * not enough: the SPA rewrite answers a missing file with index.html and 200.
 */
export async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load ${path}: ${res.status} ${res.statusText}`);
  }
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('json')) {
    throw new Error(`Failed to load ${path}: expected JSON, got ${contentType || 'no content type'}`);
  }
  return res.json() as Promise<T>;
}
