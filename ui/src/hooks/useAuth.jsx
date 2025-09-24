import React from 'react';
import { useState, useEffect, useContext, createContext } from 'react';
import { getStoredToken, getStoredUser, validateToken, clearStoredToken } from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser) {
      const isValid = await validateToken(storedToken);
      if (isValid) {
        setUser(storedUser);
        setToken(storedToken);
        setIsAuthenticated(true);
      } else {
        clearStoredToken();
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  const login = (userData) => {
    const storedToken = getStoredToken();
    setUser(userData);
    setToken(storedToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
