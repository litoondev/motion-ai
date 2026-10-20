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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the stored token.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (getToken()) {
        try {
          const me = await authService.me();
          if (!cancelled) setUser(me);
        } catch {
          // invalid / expired token (api.ts already cleared it on 401)
          if (!cancelled) setUser(null);
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // The API said 401 somewhere -> drop the session everywhere.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  // Keep several tabs in sync (logout in one tab logs out the others).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "motionai_token" && !e.newValue) setUser(null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signIn = useCallback((token: string, nextUser: User) => {
    setToken(token);
    setUser(nextUser);
    setLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // token already invalid / network error - we still log out locally
    }
    clearToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setUser(await authService.me());
    } catch {
      /* 401 is handled globally */
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signOut, refreshUser, setUser }),
    [user, loading, signIn, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
