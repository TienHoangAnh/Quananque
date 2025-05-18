const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test đăng ký tài khoản khách hàng
const testRegister = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/customers/register`, {
      name: 'Khách Hàng Test',
      email: 'khachhang@example.com',
      phone: '0987654321',
      password: 'password123',
      address: 'Địa chỉ test'
    });

    console.log('Đăng ký thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi đăng ký:', error.response?.data || error.message);
    return null;
  }
};

// Test đăng nhập tài khoản khách hàng
const testLogin = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/customers/login`, {
      email: 'khachhang@example.com',
      password: 'password123'
    });

    console.log('Đăng nhập thành công:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi đăng nhập:', error.response?.data || error.message);
    return null;
  }
};

// Chạy các test
const runTests = async () => {
  console.log('============= BẮT ĐẦU TEST API =============');
  
  // Test đăng ký
  console.log('\n1. Test đăng ký tài khoản:');
  await testRegister();
  
  // Test đăng nhập
  console.log('\n2. Test đăng nhập:');
  const loginData = await testLogin();
  
  console.log('\n============= KẾT THÚC TEST =============');
};

// Chạy các test
runTests(); 