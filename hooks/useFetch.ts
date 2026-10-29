import { useState, useEffect } from 'react';

/**
 * Runs an async fetcher on mount and tracks data/loading/error.
 * Unmount-safe: ignores results that resolve after the component unmounts.
 * Knows nothing about JSON paths or Google Sheets — pass any async fn,
 * e.g. () => fetch(url).then(r => r.json()) or
 * () => fetchWithFallback(fetchEvents, '/data/events.json').
 */
export default function useFetch<T>(
  fetcher: () => Promise<T>,
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    fetcher()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // Runs once on mount: callers pass an inline fetcher, so listing it would refetch every render
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only on purpose (see above)
  }, []);

  return { data, loading, error };
}
