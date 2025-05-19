import axios from 'axios';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Cho phép gửi cookies trong cross-origin requests
    timeout: 10000, // Timeout sau 10 giây
});

// Thêm interceptor để xử lý token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Thêm interceptor để xử lý response
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Xử lý lỗi 401 (Unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Thử refresh token nếu có
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await api.post('/auth/refresh-token', { refreshToken });
                    const { token } = response.data;
                    
                    localStorage.setItem('token', token);
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Nếu refresh token thất bại, xóa token và chuyển về trang login
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
        }

        // Xử lý các lỗi khác
        if (error.response?.status === 403) {
            // Xử lý lỗi Forbidden
            console.error('Access denied');
        }

        return Promise.reject(error);
    }
);

// API calls cho orders
export const orderAPI = {
    // Lấy danh sách đơn hàng
    getOrders: async () => {
        try {
            const response = await api.get('/orders');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Lấy chi tiết một đơn hàng
    getOrderById: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Tạo đơn hàng mới
    createOrder: async (orderData) => {
        try {
            const response = await api.post('/orders', orderData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Cập nhật trạng thái đơn hàng
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await api.patch(`/orders/${orderId}/status`, { status });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

// API calls cho products
export const productAPI = {
    // Lấy danh sách sản phẩm
    getProducts: async () => {
        try {
            const response = await api.get('/products');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Lấy chi tiết một sản phẩm
    getProductById: async (productId) => {
        try {
            const response = await api.get(`/products/${productId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

// API calls cho authentication
export const authAPI = {
    // Đăng nhập
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Đăng ký
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Lấy thông tin user hiện tại
    getCurrentUser: async () => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default api; 