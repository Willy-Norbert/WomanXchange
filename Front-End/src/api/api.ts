
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request interceptor: Token added to request');
    } else {
      console.log('Request interceptor: No token found');
    }
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response successful:', response.config.url);
    return response;
  },
  (error) => {
    console.error('API response error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('Unauthorized response detected, clearing auth data');
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear axios header
      delete api.defaults.headers.common['Authorization'];
      
      // Only redirect if not already on login page and not during token verification
      const isLoginPage = window.location.pathname === '/login';
      const isRegisterPage = window.location.pathname === '/register';
      const isTokenVerification = error.config?.url?.includes('/auth/verify-token');
      
      if (!isLoginPage && !isRegisterPage && !isTokenVerification) {
        console.log('Redirecting to login page');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
