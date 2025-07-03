import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../constants/Config';

const AuthContext = createContext({
  token: null,
  setToken: () => {},
  login: async () => {},
  logout: () => {},
  register: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      const savedToken = await AsyncStorage.getItem('token');
      if (savedToken) setToken(savedToken);
    };
    loadToken();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const receivedToken = response.data.token;
      setToken(receivedToken);
      await AsyncStorage.setItem('token', receivedToken);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    setToken(null);
    await AsyncStorage.removeItem('token');
  };

  const register = async (data) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, data);
      // Opcional: efetuar login automaticamente ou redirecionar para a tela de login.
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ token, setToken, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
