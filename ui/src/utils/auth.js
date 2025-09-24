import { apiRequest } from './api';

// Auth storage keys
export const AUTH_TOKEN_KEY = 'ai_escape_game_token';
export const AUTH_USER_KEY = 'ai_escape_game_user';

// Get token from localStorage
export const getStoredToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

// Store token in localStorage
export const storeToken = (token, user) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

// Clear stored token                           
export const clearStoredToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

// Get stored user data
export const getStoredUser = () => {
  const userData = localStorage.getItem(AUTH_USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

// Validate token with backend
export const validateToken = async (token) => {
  try {
    const res = await apiRequest('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok;
  } catch (err) {
    console.error('Token validation error:', err);
    return false;
  }
};
