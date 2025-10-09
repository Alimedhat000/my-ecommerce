import { useState, useEffect } from 'react';

import { api } from '@/api/client';
import { useContext } from 'react';

import { createContext } from 'react';

type User = {
  id: number;
  name: string;
  email: string;
};

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (token: string, user: User) => {
    setAccessToken(token);
    setUser(user);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setAccessToken(null);
    setUser(null);
    localStorage.setItem('wasLoggedOut', 'true');
    delete api.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    const refresh = async () => {
      if (localStorage.getItem('wasLoggedOut') === 'true') {
        localStorage.removeItem('wasLoggedOut');
        setLoading(false);
        return;
      }
      try {
        const res = await api.post('/auth/refresh');
        if (res.data.success && res.data.data) {
          const { accessToken, user } = res.data.data;
          login(accessToken, user);
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    refresh();
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
