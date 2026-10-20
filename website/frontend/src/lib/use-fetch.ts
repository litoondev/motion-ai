"use client";
import { useCallback, useEffect, useState, type DependencyList } from "react";
import { errorMessage } from "@/lib/api";

interface FetchState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Last successful result per cacheKey, so revisiting a page renders instantly while it refreshes.
const cache = new Map<string, unknown>();

/** Must be called whenever the signed-in user changes, so one account never sees another's data. */
export function clearFetchCache() {
  cache.clear();
}

/**
 * Minimal data hook: runs `fetcher` on mount and whenever `deps` change.
 * `reload()` refetches in the background without flashing the loading state.
 * With `cacheKey`, a previous result is shown immediately and refreshed in the background.
 */
export function useFetch<T>(fetcher: () => Promise<T>, deps: DependencyList = [], options: { cacheKey?: string } = {}) {
  const { cacheKey } = options;
  const [state, setState] = useState<FetchState<T>>(() => {
    const cached = cacheKey ? (cache.get(cacheKey) as T | undefined) : undefined;
    return cached !== undefined ? { data: cached, error: null, loading: false } : { data: null, error: null, loading: true };
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((data) => {
        if (cancelled) return;
        if (cacheKey) cache.set(cacheKey, data);
        setState({ data, error: null, loading: false });
      })
      .catch((err) => {
        if (!cancelled) setState((s) => ({ data: s.data, error: errorMessage(err), loading: false }));
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { ...state, reload };
}
