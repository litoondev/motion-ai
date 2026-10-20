"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@/lib/types";
import { getMe } from "@/services/auth";
import { getAuthToken, clearAuthCookie } from "@/lib/auth-cookie";

interface AuthContextType {
  user: User | null;
  token: string | undefined;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: undefined,
  loading: true,
  logout: () => {},
  refreshUser: async () => {},
});

const PUBLIC_PATHS = ["/login"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const stored = getAuthToken();
    if (!stored) {
      setLoading(false);
      if (!PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        router.push("/login");
      }
      return;
    }
    setToken(stored);
    try {
      const me = await getMe(stored);
      if (me.role !== "admin") {
        clearAuthCookie();
        setToken(undefined);
        router.push("/login");
        return;
      }
      setUser(me);
      if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        router.push("/");
      }
    } catch {
      clearAuthCookie();
      setToken(undefined);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    clearAuthCookie();
    setUser(null);
    setToken(undefined);
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, token, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
