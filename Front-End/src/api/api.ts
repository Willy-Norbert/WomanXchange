
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
      console.log('Request interceptor: Token added to request for', config.url);
    } else {
      console.log('Request interceptor: No token found for', config.url);
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
    console.error('API response error:', error.response?.status, error.response?.data, 'for URL:', error.config?.url);
    
    if (error.response?.status === 401) {
      console.log('Unauthorized response detected for URL:', error.config?.url);
      
      // Only clear auth data and redirect if this is NOT the initial token verification
      const isTokenVerification = error.config?.url?.includes('/auth/verify-token');
      
      if (!isTokenVerification) {
        console.log('Clearing auth data due to 401 error (not from token verification)');
        
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear axios header
        delete api.defaults.headers.common['Authorization'];
        
        // Only redirect if not already on login/register pages
        const isLoginPage = window.location.pathname === '/login';
        const isRegisterPage = window.location.pathname === '/register';
        
        if (!isLoginPage && !isRegisterPage) {
          console.log('Redirecting to login page due to 401 error');
          window.location.href = '/login';
        }
      } else {
        console.log('401 error from token verification - will be handled by AuthContext');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
