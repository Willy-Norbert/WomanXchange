
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
      console.log('🔄 AuthContext: Initializing authentication...');
      
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      console.log('📦 AuthContext: Stored user data:', userData ? 'EXISTS' : 'MISSING');
      console.log('🔑 AuthContext: Stored token:', token ? 'EXISTS' : 'MISSING');
      
      if (!userData || !token) {
        console.log('❌ AuthContext: No stored auth data found, user not logged in');
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        console.log('👤 AuthContext: Parsed user data:', parsedUser);
        
        // Set the token in axios defaults BEFORE making the request
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('🔧 AuthContext: Set token in axios defaults');
        
        // Verify token is still valid
        console.log('🔍 AuthContext: Verifying token with server...');
        const response = await api.get('/auth/verify-token');
        console.log('✅ AuthContext: Token verification response:', response.data);
        
        if (response.data.success && response.data.user) {
          // Update user data with fresh data from server
          const freshUserData = {
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            role: response.data.user.role,
            token: token // Keep the original token
          };
          
          console.log('🔄 AuthContext: Updating user data with fresh server data:', freshUserData);
          
          // Update localStorage with fresh user data
          localStorage.setItem('user', JSON.stringify(freshUserData));
          
          // Set user state - THIS IS CRITICAL
          setUser(freshUserData);
          console.log('✅ AuthContext: User successfully restored and logged in');
        } else {
          console.log('❌ AuthContext: Invalid token verification response format');
          clearAuthData();
        }
      } catch (error) {
        console.error('❌ AuthContext: Token verification failed:', error);
        console.log('🧹 AuthContext: Clearing invalid auth data');
        clearAuthData();
      }
      
      setLoading(false);
      console.log('✅ AuthContext: Authentication initialization complete');
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    console.log('🧹 AuthContext: Clearing all authentication data');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const login = (userData: UserResponse) => {
    console.log('🔐 AuthContext: Logging in user:', userData.email);
    try {
      // Store in localStorage first
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      console.log('💾 AuthContext: Stored user data in localStorage');
      
      // Set axios default header
      api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      console.log('🔧 AuthContext: Set axios authorization header');
      
      // Update state
      setUser(userData);
      console.log('✅ AuthContext: Login successful, user state updated');
    } catch (error) {
      console.error('❌ AuthContext: Error during login:', error);
      clearAuthData();
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext: Logging out user');
    try {
      clearAuthData();
      // Redirect to login page
      console.log('🔄 AuthContext: Redirecting to login page');
      window.location.href = '/login';
    } catch (error) {
      console.error('❌ AuthContext: Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
