import { useState, useEffect, useCallback } from "react";

export const AUTH_API_URL = "https://functions.poehali.dev/fe326327-ddcf-45e2-b2c5-b831016bb984";
export const CMS_API_URL = "https://functions.poehali.dev/2b809096-85e0-45ee-a1bd-a4176cc18baa";

const TOKEN_KEY = "cms_admin_token";
const USER_KEY = "cms_admin_user";

export interface AdminUser {
  id: number;
  username: string;
  display_name: string;
  role: "owner" | "editor" | "viewer";
  permissions: string[];
}

export function getStoredToken(): string {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function getStoredUser(): AdminUser | null {
  try {
    const s = localStorage.getItem(USER_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function useAdminAuth() {
  const [token, setToken] = useState<string>(getStoredToken);
  const [user, setUser] = useState<AdminUser | null>(getStoredUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [setupUserId, setSetupUserId] = useState<number | null>(null);

  const storeAuth = (t: string, u: AdminUser) => {
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken("");
    setUser(null);
  };

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(AUTH_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", username, password }),
      });
      const data = await r.json();
      if (data.setup_required) {
        setSetupRequired(true);
        setSetupUserId(data.user_id);
        setLoading(false);
        return { setupRequired: true };
      }
      if (!r.ok) {
        setError(data.error || "Ошибка входа");
        setLoading(false);
        return { error: data.error };
      }
      storeAuth(data.token, data.user);
      setLoading(false);
      return { ok: true };
    } catch {
      setError("Ошибка соединения");
      setLoading(false);
      return { error: "Ошибка соединения" };
    }
  }, []);

  const setupPassword = useCallback(async (newPassword: string) => {
    if (!setupUserId) return { error: "Нет userId" };
    setLoading(true);
    try {
      const r = await fetch(AUTH_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup_password", user_id: setupUserId, new_password: newPassword }),
      });
      const data = await r.json();
      if (!r.ok) return { error: data.error };
      setSetupRequired(false);
      setSetupUserId(null);
      return { ok: true };
    } catch {
      return { error: "Ошибка соединения" };
    } finally {
      setLoading(false);
    }
  }, [setupUserId]);

  const logout = useCallback(async () => {
    if (token) {
      fetch(AUTH_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Token": token },
        body: JSON.stringify({ action: "logout" }),
      }).catch(() => {});
    }
    clearAuth();
  }, [token]);

  const verifyToken = useCallback(async () => {
    if (!token) return false;
    try {
      const r = await fetch(AUTH_API_URL, {
        headers: { "X-Admin-Token": token },
      });
      if (!r.ok) { clearAuth(); return false; }
      const data = await r.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return true;
      }
      clearAuth();
      return false;
    } catch {
      return false;
    }
  }, [token]);

  useEffect(() => {
    if (token) verifyToken();
  }, []);

  const can = useCallback((permission: string) => {
    return user?.permissions?.includes(permission) ?? false;
  }, [user]);

  return {
    token, user, loading, error, setupRequired, setupUserId,
    login, logout, setupPassword, verifyToken, can,
    isAuthed: !!token && !!user,
  };
}
