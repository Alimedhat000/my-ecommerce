import { useState, useEffect, useRef } from 'react';
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
  const interceptorId = useRef<number | null>(null);

  const login = (token: string, user: User) => {
    setAccessToken(token);
    setUser(user);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setAccessToken(null);
    setUser(null);
    localStorage.setItem('wasLoggedOut', 'true');
    delete api.defaults.headers.common['Authorization'];
  };

  // Setup axios interceptor
  useEffect(() => {
    // Request interceptor - ensures token is always attached
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        // If we have an access token, attach it to every request
        if (accessToken && config.headers) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handles token refresh on 401
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 error and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const res = await api.post('/auth/refresh');

            if (res.data.success && res.data.data) {
              const { accessToken: newToken, user: newUser } = res.data.data;

              // Update state and header
              setAccessToken(newToken);
              setUser(newUser);
              api.defaults.headers.common['Authorization'] =
                `Bearer ${newToken}`;

              // Update the failed request with new token
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

              // Retry the original request
              return api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            await logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Store interceptor IDs
    interceptorId.current = responseInterceptor;

    // Cleanup: eject interceptors when component unmounts
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken]); // Re-run when accessToken changes

  // Initial token refresh on mount
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
      } catch (error) {
        console.error('Refresh error:', error);
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
