import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('fleetflow_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('fleetflow_token');
      if (storedToken) {
        try {
          const res = await axiosClient.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('fleetflow_token');
          localStorage.removeItem('fleetflow_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('fleetflow_token', receivedToken);
    localStorage.setItem('fleetflow_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return res;
  };

  const register = async (formData) => {
    const res = await axiosClient.post('/auth/register', formData);
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('fleetflow_token', receivedToken);
    localStorage.setItem('fleetflow_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('fleetflow_token');
    localStorage.removeItem('fleetflow_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
