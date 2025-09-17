import React, { createContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authServices';

type AuthContextType = {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  checkAuthStatus: () => Promise<void>;
  register: (data: any) => Promise<any>;
  login: (creds: { email: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userJson = await AsyncStorage.getItem('userData');
      setIsAuthenticated(!!token);
      setUser(userJson ? JSON.parse(userJson) : null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuthStatus(); }, [checkAuthStatus]);

  const register = (data: any) => authService.registerUser(data);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await authService.loginUser(credentials);
    if (res?.token) {
      setIsAuthenticated(true);
      if (res.user) setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, checkAuthStatus, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};