
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
      console.log('🚀 AuthContext: Starting authentication initialization...');
      
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        console.log('📦 AuthContext: localStorage user:', userData ? 'EXISTS' : 'MISSING');
        console.log('🔑 AuthContext: localStorage token:', token ? 'EXISTS' : 'MISSING');
        
        if (!userData || !token) {
          console.log('❌ AuthContext: No stored auth data found');
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userData);
        console.log('👤 AuthContext: Parsed user from localStorage:', parsedUser);
        
        // Set the authorization header BEFORE making the verification request
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('🔧 AuthContext: Set Authorization header in axios defaults');
        
        console.log('🔍 AuthContext: Making token verification request...');
        const response = await api.get('/auth/verify-token');
        console.log('✅ AuthContext: Token verification response:', response.data);
        
        if (response.data.success && response.data.user) {
          const verifiedUser = {
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            role: response.data.user.role,
            token: token // Keep the original token
          };
          
          console.log('🔄 AuthContext: Setting verified user data:', verifiedUser);
          
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(verifiedUser));
          
          // Set user state - THIS IS THE CRITICAL PART
          setUser(verifiedUser);
          console.log('✅ AuthContext: User state successfully set, user is logged in');
        } else {
          console.log('❌ AuthContext: Invalid token verification response');
          throw new Error('Invalid token verification response');
        }
      } catch (error) {
        console.error('❌ AuthContext: Token verification failed:', error);
        console.log('🧹 AuthContext: Clearing invalid auth data');
        
        // Clear all auth data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setLoading(false);
        console.log('🏁 AuthContext: Authentication initialization completed');
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: UserResponse) => {
    console.log('🔐 AuthContext: Logging in user:', userData.email);
    
    try {
      // Store in localStorage
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
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext: Logging out user');
    
    // Clear all auth data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    
    // Redirect to login page
    console.log('🔄 AuthContext: Redirecting to login page');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
