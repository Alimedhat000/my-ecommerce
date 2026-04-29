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
      await api.post(
        '/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('Logout request failed (non-critical):', error);
      }
    }
    setAccessToken(null);
    setUser(null);
    localStorage.setItem('wasLoggedOut', 'true');
    delete api.defaults.headers.common['Authorization'];
  };

  // Setup axios interceptor
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (accessToken && config.headers) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Don't retry if it's already a refresh token request
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          originalRequest.url !== '/auth/refresh'
        ) {
          originalRequest._retry = true;

          try {
            const res = await api.post('/auth/refresh');

            if (res.data.success && res.data.data) {
              const { accessToken: newToken, user: newUser } = res.data.data;

              setAccessToken(newToken);
              setUser(newUser);
              api.defaults.headers.common['Authorization'] =
                `Bearer ${newToken}`;

              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          } catch {
            // Token refresh failed - user will need to re-login
            if (process.env.NODE_ENV === 'development') {
              console.debug('Token refresh failed, session expired');
            }
            setAccessToken(null);
            setUser(null);
          }
        }

        return Promise.reject(error);
      }
    );

    // Store interceptor IDs
    interceptorId.current = responseInterceptor;

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken]);

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
        // No session to restore - this is expected for new users
        if (process.env.NODE_ENV === 'development') {
          console.debug('No active session to restore');
        }
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
  if (!context) {
    // In development, warn but return a safe default
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'useAuth was called outside of AuthProvider. Returning null context.'
      );
    }
    // Return a safe default object to prevent crashes
    return {
      user: null,
      accessToken: null,
      login: () => {},
      logout: async () => {},
      isAuthenticated: false,
      loading: false,
    };
  }
  return context;
};
