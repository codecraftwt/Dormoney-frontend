import { createContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { clearAuth, getToken, getUser, saveAuth } from "../lib/storage";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/api/auth/me")
      .then((res) => {
        setUser(res.data.user);
        saveAuth({ token, user: res.data.user });
      })
      .catch(() => {
        clearAuth();
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = ({ token: nextToken, user: nextUser }) => {
    saveAuth({ token: nextToken, user: nextUser });
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (_error) {
      // Ignore logout API errors for MVP.
    }
    clearAuth();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === "admin",
      login,
      logout,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
