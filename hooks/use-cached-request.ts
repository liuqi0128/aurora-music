import { useCallback, useEffect, useRef, useState } from 'react';

type CachedRequestEntry<T> = {
  data?: T;
  hasData: boolean;
  promise?: Promise<T>;
  requestToken?: number;
};

type CachedRequestOptions<T> = {
  enabled?: boolean;
  initialData?: T;
};

type LoadOptions = {
  force?: boolean;
  refreshing?: boolean;
};

const cachedRequests = new Map<string, CachedRequestEntry<unknown>>();
let cachedRequestToken = 0;

function getCachedRequestEntry<T>(key: string) {
  const current = cachedRequests.get(key) as CachedRequestEntry<T> | undefined;

  if (current) {
    return current;
  }

  const next: CachedRequestEntry<T> = {
    hasData: false,
  };

  cachedRequests.set(key, next as CachedRequestEntry<unknown>);

  return next;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Request failed';
}

export function clearCachedRequest(key: string) {
  cachedRequests.delete(key);
}

export function clearAllCachedRequests() {
  cachedRequests.clear();
}

export function useCachedRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CachedRequestOptions<T> = {}
) {
  const { enabled = true, initialData } = options;
  const initialEntry = cachedRequests.get(key) as CachedRequestEntry<T> | undefined;
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const [data, setData] = useState<T | undefined>(() =>
    initialEntry?.hasData ? initialEntry.data : initialData
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(() => enabled && !initialEntry?.hasData);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(
    async ({ force = false, refreshing: shouldRefresh = false }: LoadOptions = {}) => {
      if (!enabled) {
        return;
      }

      const entry = getCachedRequestEntry<T>(key);

      if (!force && entry.hasData) {
        setData(entry.data);
        setError('');
        setLoading(false);

        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      if (shouldRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      let requestPromise = entry.promise;
      let requestToken = entry.requestToken;

      if (force || !requestPromise) {
        cachedRequestToken += 1;
        requestToken = cachedRequestToken;
        requestPromise = fetcher();
        entry.promise = requestPromise;
        entry.requestToken = requestToken;
      }

      try {
        const result = await requestPromise;
        const isCurrentCacheRequest = entry.requestToken === requestToken;

        if (isCurrentCacheRequest) {
          entry.data = result;
          entry.hasData = true;
        }

        if (isCurrentCacheRequest && entry.promise === requestPromise) {
          entry.promise = undefined;
        }

        if (isCurrentCacheRequest && mountedRef.current && requestIdRef.current === requestId) {
          setData(result);
          setError('');
        }
      } catch (requestError) {
        const isCurrentCacheRequest = entry.requestToken === requestToken;

        if (isCurrentCacheRequest && entry.promise === requestPromise) {
          entry.promise = undefined;
        }

        if (isCurrentCacheRequest && mountedRef.current && requestIdRef.current === requestId) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (mountedRef.current && requestIdRef.current === requestId) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [enabled, fetcher, key]
  );

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => load({ force: true, refreshing: true }), [load]);
  const reload = useCallback(() => load({ force: true }), [load]);

  return {
    data,
    error,
    loading,
    refresh,
    refreshing,
    reload,
  };
}
