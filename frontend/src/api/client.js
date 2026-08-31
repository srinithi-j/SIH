import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({ baseURL: API_BASE_URL });

// Attach JWT from localStorage to every request, if present.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sih_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Central 401 handling: bounce to login if the token is invalid/expired.
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('sih_token');
      localStorage.removeItem('sih_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default apiClient;
