import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiredModalOpen, setSessionExpiredModalOpen] = useState(false);

  const getStoredToken = useCallback(() => {
    return localStorage.getItem('kurti_token') || sessionStorage.getItem('kurti_token');
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getStoredToken()) {
        await api.post('/auth/logout').catch(() => {});
      }
    } finally {
      localStorage.removeItem('kurti_token');
      sessionStorage.removeItem('kurti_token');
      localStorage.removeItem('kurti_user');
      sessionStorage.removeItem('kurti_user');
      setUser(null);
      setToken(null);
    }
  }, [getStoredToken]);

  const checkAuthStatus = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.data?.success && response.data?.data?.user) {
        setUser(response.data.data.user);
        setToken(storedToken);
      } else {
        await logout();
      }
    } catch (_error) {
      localStorage.removeItem('kurti_token');
      sessionStorage.removeItem('kurti_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [getStoredToken, logout]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password, rememberMe = false) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data?.success && response.data?.data) {
        const { token: jwtToken, user: userData } = response.data.data;

        if (rememberMe) {
          localStorage.setItem('kurti_token', jwtToken);
          localStorage.setItem('kurti_user', JSON.stringify(userData));
        } else {
          sessionStorage.setItem('kurti_token', jwtToken);
          sessionStorage.setItem('kurti_user', JSON.stringify(userData));
        }

        setToken(jwtToken);
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Login failed',
        };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Invalid email or password';
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionExpired = () => {
    setSessionExpiredModalOpen(true);
    logout();
  };

  const closeSessionExpiredModal = () => {
    setSessionExpiredModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        checkAuthStatus,
        sessionExpiredModalOpen,
        handleSessionExpired,
        closeSessionExpiredModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
