import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Tạo instance axios với URL cơ sở
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Thêm credentials
});

// Interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    // Kiểm tra xem API call có liên quan đến customer không
    if (config.url.includes('/customers')) {
      const customerToken = localStorage.getItem('customerToken');
      if (customerToken) {
        config.headers.Authorization = `Bearer ${customerToken}`;
        console.log('Sending customer token:', customerToken);
      } else {
        console.warn('No customer token available for customer API call:', config.url);
      }
    } else {
      // Các API call khác sử dụng token của staff/admin
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Sending staff token:', token);
      }
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => {
    // Thêm debug log cho endpoints liên quan đến giao dịch và đơn hàng
    if (response.config.url.includes('/transactions') || response.config.url.includes('/orders')) {
      console.log(`API response for ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error) => {
    // Log chi tiết hơn cho lỗi
    if (error.response) {
      // Lỗi từ server với response
      console.error(
        `API error (${error.config.url}):`, 
        error.response.status, 
        error.response.data
      );
    } else if (error.request) {
      // Request đã được gửi nhưng không nhận được response
      console.error('No response received:', error.request);
    } else {
      // Lỗi khi set up request
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Các API calls

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const getMe = () => api.get('/auth/me');
export const registerStaff = (userData) => api.post('/auth/register', userData);

// Customer Auth
export const registerCustomer = (userData) => api.post('/customers/register', userData);
export const loginCustomer = (credentials) => api.post('/customers/login', credentials);
export const getCustomerProfile = () => api.get('/customers/profile');
export const updateCustomerProfile = (userData) => api.put('/customers/profile', userData);
export const getCustomerOrders = () => api.get('/customers/orders');

// Menu
export const getMenuItems = () => api.get('/menu');
export const getMenuItem = (id) => api.get(`/menu/${id}`);
export const createMenuItem = (data) => api.post('/menu', data);
export const updateMenuItem = (id, data) => api.put(`/menu/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);

// Reservations
export const getReservations = () => api.get('/reservations');
export const getReservation = (id) => api.get(`/reservations/${id}`);
export const createReservation = (data) => api.post('/reservations', data);
export const updateReservation = (id, data) => api.put(`/reservations/${id}`, data);
export const deleteReservation = (id) => api.delete(`/reservations/${id}`);

// Orders
export const getOrders = () => api.get('/orders');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post('/orders', data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
export const trackOrder = (code) => api.get(`/orders/track/${code}`);

// Inventory
export const getInventory = () => api.get('/inventory');
export const getInventoryItem = (id) => api.get(`/inventory/${id}`);
export const createInventoryItem = (data) => api.post('/inventory', data);
export const updateInventoryItem = (id, data) => api.put(`/inventory/${id}`, data);
export const deleteInventoryItem = (id) => api.delete(`/inventory/${id}`);
export const importInventory = (data) => api.post('/inventory/import', data);
export const exportInventory = (data) => api.post('/inventory/export', data);
export const getTransactions = () => api.get('/inventory/transactions');

// Dashboard
export const getTodayStats = () => api.get('/dashboard/today');
export const getRevenueStats = (params) => api.get('/dashboard/revenue', { params });
export const getTopItems = (params) => api.get('/dashboard/top-items', { params });
export const getProfitStats = (params) => api.get('/dashboard/profit', { params });

export default api; 