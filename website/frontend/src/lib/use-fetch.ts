"use client";
import { useCallback, useEffect, useState, type DependencyList } from "react";
import { errorMessage } from "@/lib/api";

interface FetchState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Minimal data hook: runs `fetcher` on mount and whenever `deps` change.
 * `reload()` refetches in the background without flashing the loading state.
 */
export function useFetch<T>(fetcher: () => Promise<T>, deps: DependencyList = []) {
  const [state, setState] = useState<FetchState<T>>({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false });
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
