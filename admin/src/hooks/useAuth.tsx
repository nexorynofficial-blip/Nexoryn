import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, ApiRequestError } from "../lib/api";
import type { AdminUser } from "../types";

interface AuthContextValue {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-read the session after the admin edits their own profile, so the
   *  sidebar and greeting pick up a new display name without a reload. */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AdminUser>("/api/v1/admin/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.post<AdminUser>("/api/v1/admin/auth/login", { email, password });
    setUser(result);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/v1/admin/auth/logout");
    } catch {
      // Even if the network call fails, drop the local session state.
    }
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const me = await api.get<AdminUser>("/api/v1/admin/auth/me").catch(() => null);
    if (me) setUser(me);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiRequestError };
