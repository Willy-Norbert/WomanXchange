
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
      
      console.log('Stored user data:', userData);
      console.log('Stored token:', token ? 'exists' : 'missing');
      
      if (userData && token) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('Parsed user:', parsedUser);
          
          // Verify token is still valid
          try {
            // Set token in header first
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            const response = await api.get('/auth/verify-token');
            console.log('Token verification successful:', response.data);
            
            // Token is valid, set user
            setUser(parsedUser);
          } catch (error) {
            console.error('Token verification failed:', error);
            // Token is invalid, clear everything
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } else {
        console.log('No stored user data or token found');
        setUser(null);
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData: UserResponse) => {
    console.log('Logging in user:', userData);
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      setUser(userData);
      console.log('Login successful, user set');
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = () => {
    console.log('Logging out user');
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
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
