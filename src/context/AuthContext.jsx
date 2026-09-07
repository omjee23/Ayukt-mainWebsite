import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

import { API, API_BASE_URL, BACKEND_URL, ADMIN_URL, getImageSrc } from '../config/api';

export const AuthContext = createContext();
export { API, API_BASE_URL, BACKEND_URL, ADMIN_URL, getImageSrc };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  }, []);

  // Global Response Interceptor for handling expired tokens (401 Unauthorized)
  useEffect(() => {
    const interceptor = API.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn('Session expired or unauthorized. Logging out...');
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      API.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  // Sync user state from localStorage and fetch fresh profile from /api/auth/me
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
          if (isMounted) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
          }

          // Verify session with backend API
          const response = await API.get('/auth/me');
          if (response.data?.user && isMounted) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        }
      } catch (error) {
        console.error('Failed to restore auth session from backend:', error);
        logout();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [logout]);

  // Login handler
  const login = useCallback((userData, authToken) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
    setUser(userData);
    setToken(authToken);
  }, []);

  // Helper to update state and storage simultaneously
  const updateUser = useCallback((updatedUserData) => {
    setUser((prevUser) => {
      const mergedUser = { ...prevUser, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(mergedUser));
      return mergedUser;
    });
  }, []);

  // ➔ Memoize Context Value to Prevent Unnecessary Re-renders Across App
  const contextValue = useMemo(() => ({
    user,
    setUser,
    updateUser,
    token,
    setToken,
    login,
    logout,
    loading,
    API
  }), [user, token, loading, updateUser, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};