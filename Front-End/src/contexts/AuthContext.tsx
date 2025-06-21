
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { UserResponse } from '../api/auth';
import api from '../api/api';

interface AuthContextType {
  user: UserResponse | null;
  login: (userData: UserResponse) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth...');
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      console.log('Stored user data:', userData ? 'exists' : 'missing');
      console.log('Stored token:', token ? 'exists' : 'missing');
      
      if (userData && token) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('Parsed user:', parsedUser);
          
          // Set the token in axios defaults before making the request
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token is still valid
          console.log('Making token verification request...');
          const response = await api.get('/auth/verify-token');
          console.log('Token verification response:', response.data);
          
          if (response.data.success && response.data.user) {
            // Update user data with fresh data from server
            const freshUserData = {
              ...response.data.user,
              token: token // Keep the original token
            };
            
            // Update localStorage with fresh user data
            localStorage.setItem('user', JSON.stringify(freshUserData));
            
            // Token is valid, set user state
            setUser(freshUserData);
            console.log('User restored and updated:', freshUserData);
          } else {
            console.log('Token verification failed - invalid response format');
            clearAuthData();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // Token is invalid or expired, clear everything
          clearAuthData();
        }
      } else {
        console.log('No stored authentication data found');
        clearAuthData();
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    console.log('Clearing authentication data');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const login = (userData: UserResponse) => {
    console.log('Logging in user:', userData);
    try {
      // Store in localStorage first
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      
      // Set axios default header
      api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      
      // Update state
      setUser(userData);
      console.log('Login successful, user set in state and localStorage');
    } catch (error) {
      console.error('Error during login:', error);
      clearAuthData();
    }
  };

  const logout = () => {
    console.log('Logging out user');
    try {
      clearAuthData();
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
