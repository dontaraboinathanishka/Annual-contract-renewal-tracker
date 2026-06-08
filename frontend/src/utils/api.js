// Simple API wrapper that handles authorization headers automatically

const request = async (url, options = {}) => {
  const token = localStorage.getItem('oxygen_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${url}:`, error.message);
    throw error;
  }
};

export const api = {
  auth: {
    login: (email, password) => 
      request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    me: () => request('/api/auth/me')
  },
  contracts: {
    list: (queryParams = {}) => {
      const query = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, val);
        }
      });
      const queryString = query.toString();
      return request(`/api/contracts${queryString ? `?${queryString}` : ''}`);
    },
    get: (id) => request(`/api/contracts/${id}`),
    create: (data) => 
      request('/api/contracts', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id, data) => 
      request(`/api/contracts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    delete: (id) => 
      request(`/api/contracts/${id}`, {
        method: 'DELETE'
      }),
    dashboard: () => request('/api/contracts/dashboard'),
    reports: () => request('/api/contracts/reports')
  },
  users: {
    list: () => request('/api/users'),
    create: (data) => 
      request('/api/users', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id, data) => 
      request(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    delete: (id) => 
      request(`/api/users/${id}`, {
        method: 'DELETE'
      })
  },
  logs: {
    list: () => request('/api/logs')
  }
};
