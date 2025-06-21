
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
      console.log('🔧 API Request interceptor: Token added for', config.url);
    } else {
      console.log('⚠️ API Request interceptor: No token found for', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ API request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response successful for:', response.config.url);
    return response;
  },
  (error) => {
    const url = error.config?.url;
    const status = error.response?.status;
    const data = error.response?.data;
    
    console.error('❌ API Response error:', status, data, 'for URL:', url);
    
    if (status === 401) {
      console.log('🚫 Unauthorized (401) response detected for:', url);
      
      // Check if this is a token verification request
      const isTokenVerification = url?.includes('/auth/verify-token');
      
      if (isTokenVerification) {
        console.log('🔍 401 from token verification - letting AuthContext handle this');
        // Don't clear auth data here, let AuthContext handle it
        return Promise.reject(error);
      }
      
      // For other 401 errors (not token verification), clear auth data
      console.log('🧹 Clearing auth data due to 401 error (not from token verification)');
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear axios header
      delete api.defaults.headers.common['Authorization'];
      
      // Only redirect if not already on login/register pages
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/login' || currentPath === '/register';
      
      if (!isAuthPage) {
        console.log('🔄 Redirecting to login page due to 401 error');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
