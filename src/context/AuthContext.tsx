import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@/types';
import { storage } from '@/services/storage';

const DEMO_USER = {
  email: 'demo@cvinsight.ai',
  password: 'Demo@123',
  name: 'Demo User',
};

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const defaultAuthContextValue: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  login: () => ({ success: false, error: 'Authentication is unavailable.' }),
  logout: () => undefined,
};

const AuthContext = createContext<AuthContextValue>(defaultAuthContextValue);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => storage.getAuth());

  useEffect(() => {
    if (user) {
      storage.setAuth(user);
    } else {
      storage.clearAuth();
    }
  }, [user]);

  const login = useCallback((email: string, password: string) => {
    if (
      email.trim().toLowerCase() === DEMO_USER.email &&
      password === DEMO_USER.password
    ) {
      const u: User = { email: DEMO_USER.email, name: DEMO_USER.name };
      setUser(u);
      return { success: true };
    }
    return {
      success: false,
      error: 'Invalid email or password. Please check your credentials and try again.',
    };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      logout,
    }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export { DEMO_USER };
