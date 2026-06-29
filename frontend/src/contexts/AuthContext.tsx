/**
 * src/contexts/AuthContext.tsx
 * Global authentication state — wraps the entire app.
 * Replaces local state in App.tsx.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { authApi, type AuthUser } from '../api/services/authApi';
import ENV from '../config/env';

// ── Context shape ──────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,           setUser]           = useState<AuthUser | null>(null);
  const [token,          setToken]          = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ── Handle auto-logout on 401 (fired by Axios interceptor) ────────────────
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('scm:unauthorized', handler);
    return () => window.removeEventListener('scm:unauthorized', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── On mount: restore session from localStorage ────────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem(ENV.TOKEN_KEY);
    if (!savedToken) {
      setIsCheckingAuth(false);
      return;
    }

    setToken(savedToken);
    authApi
      .me()
      .then((res) => {
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
        } else {
          logout();
        }
      })
      .catch(() => logout())
      .finally(() => setIsCheckingAuth(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (username: string, password: string): Promise<void> => {
    const res = await authApi.login({ username, password });
    if (!res.data.success) {
      throw new Error(res.data.message || 'Login gagal.');
    }
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem(ENV.TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback((): void => {
    localStorage.removeItem(ENV.TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isCheckingAuth,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}

export default AuthContext;
