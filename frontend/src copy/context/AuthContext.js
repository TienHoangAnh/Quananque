import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, getMe } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kiểm tra nếu đã đăng nhập từ trước
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await getMe();
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          console.error('Lỗi xác thực:', error);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Đăng nhập
  const login = async (phone, pin) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiLogin({ phone, pin });
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Đăng nhập thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Kiểm tra vai trò người dùng
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isStaff = () => {
    return user && (user.role === 'staff' || user.role === 'admin');
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAdmin,
    isStaff
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 