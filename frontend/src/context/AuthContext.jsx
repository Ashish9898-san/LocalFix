import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../services/api';

/**
 * AuthContext.jsx
 *
 * Centralized Authentication & Authorization Context for LocalFix (Phase 9.5).
 *
 * Concepts Explained for Beginners:
 * 1. JWT Session Persistence: The backend does not store session state in server memory
 *    (Stateless REST). The client stores the JWT token in browser `localStorage`.
 * 2. Token Invalidation Check: When the user refreshes or reopens the browser, we read
 *    the stored token and call `GET /api/auth/me` to verify that the token is still valid
 *    and has not expired.
 * 3. Role-Based Access Control (RBAC):
 *    - Public Visitor: Unauthenticated (browse reports only)
 *    - Registered Citizen: Role 'USER' (can submit reports and view 'My Reports')
 *    - Administrator: Role 'ADMIN' (full access including status management)
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.warn('Failed to parse cached user data:', e);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Restore and validate session on initial application load.
   */
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        // Validate token against backend /api/auth/me
        const profile = await authApi.getMe();
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
        });
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
          })
        );
      } catch (err) {
        console.warn('Stored token is invalid or expired. Clearing auth session.', err);
        // Clear invalid credentials
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * Authenticate with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} user data
   */
  const login = async (email, password) => {
    setError(null);
    try {
      const data = await authApi.login({ email, password });
      const userObj = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      // Persist in localStorage for subsequent requests
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userObj));

      setToken(data.token);
      setUser(userObj);
      return userObj;
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your email and password.';
      setError(msg);
      throw err;
    }
  };

  /**
   * Register a new citizen account
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} user data
   */
  const register = async (name, email, password) => {
    setError(null);
    try {
      const data = await authApi.register({ name, email, password });
      const userObj = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      // Persist token and user in localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userObj));

      setToken(data.token);
      setUser(userObj);
      return userObj;
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.';
      setError(msg);
      throw err;
    }
  };

  /**
   * Log out and clear local credentials
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
