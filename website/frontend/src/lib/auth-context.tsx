"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/services/auth";
import { clearToken, getToken, setToken, UNAUTHORIZED_EVENT } from "@/lib/token";
import { clearFetchCache } from "@/lib/use-fetch";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  /** true until the first "who am I?" check has finished */
  loading: boolean;
  /** store the token returned by login / register / google */
  signIn: (token: string, user: User) => void;
  /** revoke the token on the API and forget it locally */
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Display-only copy of the last known user, so the panel renders immediately while /me revalidates.
const USER_CACHE_KEY = "motionai_user";

function readCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeCachedUser(user: User | null) {
  try {
    if (user) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_CACHE_KEY);
  } catch {
    /* storage unavailable (private mode) - just skip the cache */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setUser = useCallback((next: User | null) => {
    setUserState(next);
    writeCachedUser(next);
  }, []);

  const dropSession = useCallback(() => {
    clearFetchCache();
    setUser(null);
  }, [setUser]);

  // Restore the session: show the cached user at once, then confirm it with the API.
  useEffect(() => {
    let cancelled = false;
    if (!getToken()) {
      writeCachedUser(null);
      setLoading(false);
      return;
    }
    const cached = readCachedUser();
    if (cached) {
      setUserState(cached);
      setLoading(false);
    }
    authService
      .me()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        // invalid / expired token (api.ts already cleared it on 401)
        if (!cancelled) dropSession();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setUser, dropSession]);

  // The API said 401 somewhere -> drop the session everywhere.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, dropSession);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, dropSession);
  }, [dropSession]);

  // Keep several tabs in sync (logout in one tab logs out the others).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "motionai_token" && !e.newValue) dropSession();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [dropSession]);

  const signIn = useCallback((token: string, nextUser: User) => {
    clearFetchCache();
    setToken(token);
    setUser(nextUser);
    setLoading(false);
  }, [setUser]);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // token already invalid / network error - we still log out locally
    }
    clearToken();
    dropSession();
  }, [dropSession]);

  const refreshUser = useCallback(async () => {
    try {
      setUser(await authService.me());
    } catch {
      /* 401 is handled globally */
    }
  }, [setUser]);

  const value = useMemo(
    () => ({ user, loading, signIn, signOut, refreshUser, setUser }),
    [user, loading, signIn, signOut, refreshUser, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
