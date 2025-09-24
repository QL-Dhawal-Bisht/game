// API Base URL
export const API_BASE = 'http://localhost:8000';

// API utility functions
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('ai_escape_game_token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('ai_escape_game_token');
    localStorage.removeItem('ai_escape_game_user');
    window.location.href = '/login';
    throw new Error('Authentication required');
  }

  return response;
};

export const apiGet = (endpoint) => apiRequest(endpoint);

export const apiPost = (endpoint, data) => apiRequest(endpoint, {
  method: 'POST',
  body: JSON.stringify(data),
});

export const apiPut = (endpoint, data) => apiRequest(endpoint, {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const apiDelete = (endpoint) => apiRequest(endpoint, {
  method: 'DELETE',
});
