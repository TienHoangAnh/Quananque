import React, { createContext, useState, useEffect } from 'react';
import { getCustomerProfile } from '../utils/api';

export const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Kiểm tra nếu có thông tin khách hàng trong localStorage
    const storedCustomer = localStorage.getItem('customerInfo');
    const token = localStorage.getItem('customerToken');

    if (storedCustomer && token) {
      console.log('Found customer token and info in localStorage');
      // Thử parse customer info từ localStorage
      try {
        const parsedCustomerInfo = JSON.parse(storedCustomer);
        console.log('Parsed customer info:', parsedCustomerInfo);
        setCustomerInfo(parsedCustomerInfo);
      } catch (e) {
        console.error('Failed to parse customer info:', e);
      }
      
      // Lấy thông tin khách hàng từ API để đảm bảo dữ liệu mới nhất
      fetchCustomerProfile();
    } else {
      console.log('No customer auth data found in localStorage');
      setLoading(false);
    }
  }, []);

  // Lấy thông tin hồ sơ khách hàng từ API
  const fetchCustomerProfile = async () => {
    try {
      console.log('Fetching customer profile from API...');
      const res = await getCustomerProfile();
      console.log('Customer profile API response:', res.data);
      setCustomerInfo(res.data);
      // Cập nhật lại thông tin trong localStorage
      localStorage.setItem('customerInfo', JSON.stringify(res.data));
    } catch (error) {
      console.error('Lỗi lấy thông tin khách hàng:', error);
      setError('Không thể lấy thông tin khách hàng');
      // Xóa thông tin đăng nhập nếu token không hợp lệ
      if (error.response?.status === 401) {
        console.log('Clearing invalid customer auth data');
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerInfo');
      }
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerInfo');
    setCustomerInfo(null);
  };

  return (
    <CustomerContext.Provider
      value={{
        customerInfo,
        setCustomerInfo,
        loading,
        error,
        logout,
        fetchCustomerProfile
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}; 