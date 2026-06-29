/**
 * src/hooks/useApi.ts
 * Generic data-fetching hook with loading / error / retry states.
 * Supports auto-refresh via polling interval.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseApiOptions {
  /** If > 0, polls every N milliseconds */
  refreshInterval?: number;
  /** Run immediately on mount (default: true) */
  immediate?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  lastUpdated: Date | null;
}

export function useApi<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = [],
  options: UseApiOptions = {},
): UseApiResult<T> {
  const { refreshInterval = 0, immediate = true } = options;

  const [data,        setData]        = useState<T | null>(null);
  const [isLoading,   setIsLoading]   = useState(immediate);
  const [error,       setError]       = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchFnRef     = useRef(fetchFn);
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef   = useRef(true);

  fetchFnRef.current = fetchFn;

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFnRef.current();
      if (isMountedRef.current) {
        setData(result);
        setLastUpdated(new Date());
      }
    } catch (e: unknown) {
      if (isMountedRef.current) {
        setError(e instanceof Error ? e.message : 'Terjadi kesalahan.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    isMountedRef.current = true;

    if (immediate) execute();

    if (refreshInterval > 0) {
      intervalRef.current = setInterval(execute, refreshInterval);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [immediate, refreshInterval, execute, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, isLoading, error, refetch: execute, lastUpdated };
}

export default useApi;
