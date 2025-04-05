import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios interceptor to add token to all requests
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('AuthContext interceptor added token to request:', {
            url: config.url,
            method: config.method,
            headers: config.headers
          });
        }
        return config;
      },
      (error) => {
        console.error('AuthContext interceptor error:', error);
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    // Check for existing user session
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('Restored user session:', { user: parsedUser, token });
        
        // Set default authorization header for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Set axios default headers:', axios.defaults.headers.common);
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      console.log('Attempting login with:', { email });
      
      // Clear any existing token and user data before login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      
      const response = await apiLogin(email, password);
      console.log('Login response:', response);
      
      if (response.token && response.user) {
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        
        // Set default authorization header for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        console.log('Set axios default headers after login:', axios.defaults.headers.common);
        
        return response;
      } else {
        throw new Error('Geçersiz giriş yanıtı');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Giriş başarısız oldu');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      console.log('Attempting registration with:', { email: userData.email });
      
      // Clear any existing token and user data before registration
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      
      const response = await apiRegister(userData);
      console.log('Register response:', response);
      
      if (response.token && response.user) {
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        
        // Set default authorization header for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        console.log('Set axios default headers after register:', axios.defaults.headers.common);
        
        return response;
      } else {
        throw new Error('Geçersiz kayıt yanıtı');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Kayıt başarısız oldu');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    console.log('Removed authorization header after logout');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 